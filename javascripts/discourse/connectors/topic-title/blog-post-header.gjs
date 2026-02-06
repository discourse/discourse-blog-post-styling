import Component from "@glimmer/component";
import avatar from "discourse/helpers/avatar";
import formatDate from "discourse/helpers/format-date";
import BlogImage from "../../components/blog-image";
import BlogSummary from "../../components/blog-summary";
import isBlogTopic from "../../lib/is-blog-topic";
import isMobileDisabled from "../../lib/is-mobile-disabled";

export default class BlogPostHeader extends Component {
  static shouldRender(args, context) {
    if (isMobileDisabled(context.capabilities, settings)) {
      return false;
    }
    if (settings.image_position !== "below title") {
      return false;
    }
    if (settings.image_size === "no image") {
      return false;
    }

    return isBlogTopic(args.model, settings);
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  <template>
    <BlogSummary @topic={{this.topic}} />
    <div class="blog-post__meta">
      <div class="blog-post__avatar">
        {{avatar this.topic.details.created_by imageSize="medium"}}
      </div>
      <span
        class="blog-post__author"
      >{{this.topic.details.created_by.username}}</span>
      <span class="blog-post__publish-date">{{formatDate
          this.topic.created_at
        }}</span>
    </div>
    <BlogImage @topic={{this.topic}} />
  </template>
}
