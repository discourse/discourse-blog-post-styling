import Component from "@glimmer/component";
import BlogImage from "../../components/blog-image";
import isBlogTopic from "../../lib/is-blog-topic";
import isMobileDisabled from "../../lib/is-mobile-disabled";

export default class BlogImageAbovePostStream extends Component {
  static shouldRender(args, context) {
    if (isMobileDisabled(context.capabilities, settings)) {
      return false;
    }
    if (settings.image_size === "no image") {
      return false;
    }
    if (settings.image_position !== "above title") {
      return false;
    }
    return isBlogTopic(args.model, settings);
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  <template><BlogImage @topic={{this.topic}} /></template>
}
