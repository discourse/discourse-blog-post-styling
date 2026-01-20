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

export default apiInitializer("1.0", (api) => {
  api.onPageChange(() => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (isBlogTopic(topic)) {
      document.body.classList.add("blog-post");
    } else {
      document.body.classList.remove("blog-post");
    }
  });
});
