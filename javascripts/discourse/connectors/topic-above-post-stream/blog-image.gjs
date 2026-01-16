import Component from "@glimmer/component";
import Category from "discourse/models/category";

export default class BlogImage extends Component {
  get topic() {
    return this.args.outletArgs.model;
  }

  get isBlogTopic() {
    let hasCategory = false;
    let hasTag = false;

    if (settings.no_images) {
      return false;
    }

    if (this.topic?.category_id) {
      const allowedCategories = settings.blog_category.split(",");
      const currentCategory = Category.findById(this.topic.category_id);
      const parentCategorySlug = currentCategory.parentCategory
        ? `${currentCategory.parentCategory.slug}-`
        : "";
      hasCategory = allowedCategories.some(
        (c) => c.trim() === `${parentCategorySlug}${currentCategory.slug}`
      );
    }

    if (this.topic?.tags) {
      const allowedTags = settings.blog_tag.split("|");
      hasTag = this.topic.tags.some((topicTag) => {
        // Handle both string (old format) and object (new format) tags
        const tagName = typeof topicTag === "string" ? topicTag : topicTag.name;
        return allowedTags.includes(tagName);
      });
    }

    return hasCategory || hasTag;
  }

  get imageURL() {
    return this.topic?.thumbnails?.[0]?.url;
  }

  <template>
    {{#if this.isBlogTopic}}
      {{#if this.imageURL}}
        <div class="blog-image-container">
          <div
            class="blog-image"
            style="background-image: url('{{this.imageURL}}')"
          ></div>
        </div>
      {{/if}}
    {{/if}}
  </template>
}
