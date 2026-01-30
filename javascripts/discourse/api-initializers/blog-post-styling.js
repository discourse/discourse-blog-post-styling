import { apiInitializer } from "discourse/lib/api";
import isBlogTopic from "../lib/is-blog-topic";

const SIZE_CLASSES = [
  "--blog-image-full-width",
  "--blog-image-centered",
  "--blog-no-images",
];
const POSITION_CLASSES = [
  "--blog-image-above-title",
  "--blog-image-below-title",
];

function removeSummaryTags(firstPost) {
  if (!firstPost) {
    return;
  }
  firstPost.innerHTML = firstPost.innerHTML.replace(
    /\[summary\][\s\S]*?\[\/summary\]/i,
    ""
  );
}

function extractAndInjectSummary(firstPost) {
  document.querySelector(".blog-post__summary")?.remove();

  if (!firstPost) {
    return;
  }

  const summaryMatch = firstPost.innerHTML.match(
    /\[summary\]([\s\S]*?)\[\/summary\]/i
  );

  if (summaryMatch) {
    const summaryText = summaryMatch[1].trim();

    removeSummaryTags(firstPost);

    const titleWrapper = document.querySelector("#topic-title .title-wrapper");
    if (titleWrapper) {
      const summaryElement = document.createElement("p");
      summaryElement.className = "blog-post__summary";
      summaryElement.innerHTML = summaryText;
      titleWrapper.appendChild(summaryElement);
    }
  }
}

function getSizeClass() {
  switch (settings.image_size) {
    case "full width":
      return "--blog-image-full-width";
    case "centered":
      return "--blog-image-centered";
    case "no image":
      return "--blog-no-images";
    default:
      return null;
  }
}

function getPositionClass() {
  switch (settings.image_position) {
    case "above title":
      return "--blog-image-above-title";
    case "below title":
      return "--blog-image-below-title";
    default:
      return null;
  }
}

function removeStyleClasses() {
  document.body.classList.remove(
    ...SIZE_CLASSES,
    ...POSITION_CLASSES,
    "viewing-first-post"
  );
}

function wrapFirstLetter(firstPost) {
  if (!firstPost || firstPost.querySelector(".blog-post__drop-cap")) {
    return;
  }
  firstPost.innerHTML = firstPost.innerHTML.replace(
    /<p([^>]*)>((?:<(?!\/)[^>]+>)*)([\p{L}\p{N}])/iu,
    "<p$1>$2<span class='blog-post__drop-cap'>$3</span>"
  );
}

export default apiInitializer((api) => {
  let postState = null;

  function isFirstPost(post) {
    if (!post) {
      return;
    }

    const firstPost = post.post_number === 1;

    if (postState === firstPost) {
      return;
    }
    postState = firstPost;
    document.body.classList.toggle("viewing-first-post", firstPost);
  }

  api.onAppEvent("topic:current-post-changed", ({ post }) => {
    isFirstPost(post);
  });

  api.onAppEvent("composer:edited-post", () => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (isBlogTopic(topic, settings)) {
      const thumbnail = document.querySelector(
        ".blog-post article#post_1 .cooked > p img"
      );
      // Refresh route to reload topic data including thumbnail when thumbnail is changed
      if (
        topic?.thumbnails?.[0]?.url?.split("/")?.pop() !==
        thumbnail?.src?.split("/")?.pop()
      ) {
        const router = api.container.lookup("service:router");
        router.refresh();
      }
    }
  });

  api.onPageChange(() => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (!isBlogTopic(topic, settings)) {
      document.body.classList.remove("blog-post");
      removeStyleClasses();
      document.querySelector(".blog-post__summary")?.remove();
    }
  });

  api.decorateCookedElement(
    (elem, helper) => {
      const post = helper.model;
      if (!post || !post.firstPost) {
        return;
      }
      const topic = post.topic;

      if (!isBlogTopic(topic, settings)) {
        return;
      }
      const capabilities = api.container.lookup("service:capabilities");
      const isMobile = !capabilities.viewport.sm;
      if (isMobile && !settings.mobile_enabled) {
        document.body.classList.remove("blog-post");
        document.querySelector(".blog-post__summary")?.remove();
        removeSummaryTags(elem);
        return;
      }

      document.body.classList.add("blog-post");

      const sizeClass = getSizeClass();
      const positionClass = getPositionClass();
      if (sizeClass) {
        document.body.classList.add(sizeClass);
      }
      if (positionClass) {
        document.body.classList.add(positionClass);
      }

      extractAndInjectSummary(elem);
      if (settings.dropcap_enabled) {
        wrapFirstLetter(elem);
      }
    },
    { onlyStream: true }
  );
});
