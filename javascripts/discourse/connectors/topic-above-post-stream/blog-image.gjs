import Component from "@glimmer/component";
import Site from "discourse/models/site";
import BlogImage from "../../components/blog-image";

export default class BlogImageAbovePostStream extends Component {
  static shouldRender() {
    if (Site.currentProp("mobileView") && !settings.mobile_enabled) {
      return false;
    }
    if (settings.image_position === "no images") {
      return false;
    }
    // Only render in this outlet if NOT "image below title – full width"
    if (settings.image_position === "below title") {
      return false;
    }
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  <template><BlogImage @topic={{this.topic}} /></template>
}
