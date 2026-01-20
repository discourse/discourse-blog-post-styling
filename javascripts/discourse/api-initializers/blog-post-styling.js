import { apiInitializer } from "discourse/lib/api";
import Category from "discourse/models/category";

function isBlogTopic(topic) {
  if (!topic) {
    return false;
  }

  let hasCategory = false;
  let hasTag = false;

  if (topic.category_id) {
    const allowedCategories = settings.blog_category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const currentCategory = Category.findById(topic.category_id);
    if (currentCategory) {
      const parentCategorySlug = currentCategory.parentCategory
        ? `${currentCategory.parentCategory.slug}-`
        : "";
      hasCategory = allowedCategories.some(
        (c) => c === `${parentCategorySlug}${currentCategory.slug}`
      );
    }
  }

  if (topic.tags) {
    const allowedTags = settings.blog_tag
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean);
    hasTag = allowedTags.some((tag) => topic.tags.includes(tag));
  }

  return hasCategory || hasTag;
}

function extractAndInjectSummary() {
  document.querySelector(".blog-post__summary")?.remove();

  const cookedContent = document.querySelector("#post_1 .cooked");
  if (!cookedContent) {
    return;
  }

  const summaryMatch = cookedContent.innerHTML.match(
    /\[summary\]([\s\S]*?)\[\/summary\]/i
  );

  if (summaryMatch) {
    const summaryText = summaryMatch[1].trim();

    cookedContent.innerHTML = cookedContent.innerHTML.replace(
      /\[summary\][\s\S]*?\[\/summary\]/i,
      ""
    );

    const titleWrapper = document.querySelector("#topic-title .title-wrapper");
    if (titleWrapper) {
      const summaryElement = document.createElement("p");
      summaryElement.className = "blog-post__summary";
      summaryElement.innerHTML = summaryText;
      titleWrapper.appendChild(summaryElement);
    }
  }
}

const SIZE_CLASSES = ["--blog-image-full-width", "--blog-image-fixed"];
const POSITION_CLASSES = [
  "--blog-image-above-title",
  "--blog-image-below-title",
  "--blog-image-embedded",
];

function getSizeClass() {
  if (settings.image_position === "embedded in title") {
    return "--blog-image-full-width";
  }
  return settings.image_size === "full width"
    ? "--blog-image-full-width"
    : "--blog-image-fixed";
}

function getPositionClass() {
  switch (settings.image_position) {
    case "above title":
      return "--blog-image-above-title";
    case "below title":
      return "--blog-image-below-title";
    case "embedded in title":
      return "--blog-image-embedded";
    default:
      return null;
  }
}

function removeStyleClasses() {
  document.body.classList.remove(...SIZE_CLASSES, ...POSITION_CLASSES);
}

function wrapFirstLetter() {
  const cookedContent = document.querySelector("#post_1 .cooked");
  if (!cookedContent || cookedContent.querySelector(".blog-post__drop-cap")) {
    return;
  }

  const firstParagraph = Array.from(cookedContent.querySelectorAll("p")).find(
    (p) => p.textContent.trim().length > 0
  );

  if (!firstParagraph) {
    return;
  }

  // Get the first text node
  const walker = document.createTreeWalker(
    firstParagraph,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        node.textContent.trim().length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    }
  );

  const firstTextNode = walker.nextNode();
  if (!firstTextNode) {
    return;
  }

  const text = firstTextNode.textContent;
  const firstLetter = text.charAt(0);
  const restOfText = text.slice(1);

  const span = document.createElement("span");
  span.className = "blog-post__drop-cap";
  span.textContent = firstLetter;

  firstTextNode.textContent = restOfText;
  firstTextNode.parentNode.insertBefore(span, firstTextNode);
}

export default apiInitializer("1.0", (api) => {
  api.onPageChange(() => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (isBlogTopic(topic)) {
      document.body.classList.add("blog-post");

      removeStyleClasses();
      const sizeClass = getSizeClass();
      const positionClass = getPositionClass();
      if (sizeClass) {
        document.body.classList.add(sizeClass);
      }
      if (positionClass) {
        document.body.classList.add(positionClass);
      }

      extractAndInjectSummary();
      wrapFirstLetter();
    } else {
      document.body.classList.remove("blog-post");
      removeStyleClasses();
      document.querySelector(".blog-post__summary")?.remove();
    }
  });
});
