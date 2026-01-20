import Component from "@glimmer/component";
import { eq } from "truth-helpers";
import Category from "discourse/models/category";

export default class BlogImage extends Component {
  get topic() {
    return this.args.topic;
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
      hasTag = allowedTags.some((tag) => this.topic.tags.includes(tag));
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
              {{if
                (eq
                  settings.image_display_style 'image below title – full width'
                )
                '--full-width'
              }}"
            style="background-image: url('{{this.imageURL}}')"
          ></div>
        </div>
      {{/if}}
    {{/if}}
  </template>
}
