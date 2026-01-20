import Component from "@glimmer/component";
import avatar from "discourse/helpers/avatar";
import formatDate from "discourse/helpers/format-date";
import Site from "discourse/models/site";
import BlogImage from "../../components/blog-image";

export default class BlogImageBelowTitle extends Component {
  static shouldRender() {
    if (Site.currentProp("mobileView") && !settings.mobile_enabled) {
      return false;
    }
    if (settings.image_position !== "below title") {
      return false;
    }
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  <template>
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
