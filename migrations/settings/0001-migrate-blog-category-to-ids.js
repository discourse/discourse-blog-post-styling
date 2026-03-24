export default function migrate(settings, helpers) {
  if (settings.has("blog_category")) {
    const oldValue = settings.get("blog_category");
    if (oldValue) {
      const slugs = oldValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const ids = slugs
        .map((slug) => helpers.getCategoryIdBySlug(slug))
        .filter(Boolean);
      settings.set("blog_category", ids.join("|"));
    }
  }
  return settings;
}
