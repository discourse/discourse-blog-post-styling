export default function isBlogTopic(topic, settings) {
  if (!topic) {
    return false;
  }

  let hasCategory = false;
  let hasTag = false;

  if (topic.category_id) {
    const allowedCategories = settings.blog_category
      .split("|")
      .filter(Boolean)
      .map(Number);
    hasCategory = allowedCategories.includes(topic.category_id);
  }

  if (topic.tags) {
    const allowedTags = settings.blog_tag
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean);
    hasTag = topic.tags.some((tag) =>
      allowedTags.includes(typeof tag === "string" ? tag : tag.name)
    );
  }

  return hasCategory || hasTag;
}
