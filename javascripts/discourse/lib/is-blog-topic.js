import Category from "discourse/models/category";

export default function isBlogTopic(topic, settings) {
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
    hasTag = topic.tags.some((tag) => allowedTags.includes(tag.name));
  }

  return hasCategory || hasTag;
}
