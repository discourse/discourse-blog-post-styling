import Component from "@glimmer/component";
import BlogImage from "../../components/blog-image";

export default class BlogImageAbovePostStream extends Component {
  static shouldRender(args, context) {
    const capabilities = context.capabilities;
    if (!capabilities.viewport.sm && !settings.mobile_enabled) {
      console.log(capabilities.viewport.sm, settings.mobile_enabled);
      return false;
    }
    if (settings.image_position !== "above title") {
      return false;
    }
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  get topic() {
    return this.args.outletArgs.model;
  }

  <template><BlogImage @topic={{this.topic}} /></template>
}
