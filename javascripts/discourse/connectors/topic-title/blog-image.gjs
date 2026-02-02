import Component from "@glimmer/component";
import { eq } from "truth-helpers";
import avatar from "discourse/helpers/avatar";
import formatDate from "discourse/helpers/format-date";
import BlogImage from "../../components/blog-image";
import isBlogTopic from "../../lib/is-blog-topic";

export default class BlogImageBelowTitle extends Component {
  static shouldRender(args, context) {
    if (!context.capabilities.viewport.sm && !settings.mobile_enabled) {
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

  get summary() {
    const summaryMatch = this.topic
      .firstPost()
      ._result.cooked.match(/\[summary\]([\s\S]*?)\[\/summary\]/i);

    if (summaryMatch) {
      const summaryText = summaryMatch[1].trim();
      return summaryText;
    }
  }

  <template>
    {{#if this.summary}}
      <p class="blog-post__summary">
        {{this.summary}}
      </p>
    {{/if}}
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
