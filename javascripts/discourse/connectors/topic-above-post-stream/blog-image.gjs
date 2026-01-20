import Component from "@glimmer/component";
import { eq } from "truth-helpers";
import Category from "discourse/models/category";
import Site from "discourse/models/site";

export default class BlogImage extends Component {
  static shouldRender() {

    if (Site.currentProp("mobileView") && !settings.mobile_enabled) {
      return false;
    }
    // Don't render if no_images is enabled or no categories/tags are configured
    if (settings.no_images) {
      return false;
    }
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  get isBlogTopic() {
    let hasCategory = false;
    let hasTag = false;

    if (this.topic?.category_id) {
      const allowedCategories = settings.blog_category.split(",");
      const currentCategory = Category.findById(this.topic.category_id);
      if (currentCategory) {
        const parentCategorySlug = currentCategory.parentCategory
          ? `${currentCategory.parentCategory.slug}-`
          : "";
        hasCategory = allowedCategories.some(
          (c) => c.trim() === `${parentCategorySlug}${currentCategory.slug}`
        );
      }
    }

    if (this.topic?.tags) {
      const allowedTags = settings.blog_tag.split("|");
      // TODO(https://github.com/discourse/discourse/pull/36678): The string check can be
      // removed using .discourse-compatibility once the PR is merged.
      hasTag = this.topic.tags.some((t) => {
        const tagName = typeof t === "string" ? t : t.name;
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
            class="blog-image
              {{if (eq settings.image_display_style 'responsive crop') '--responsive-crop'}}"
            style="background-image: url('{{this.imageURL}}')"
          ></div>
        </div>
      {{/if}}
    {{/if}}
  </template>
}
