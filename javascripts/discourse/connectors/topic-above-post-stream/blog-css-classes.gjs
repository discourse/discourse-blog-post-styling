import Component from "@glimmer/component";
import { service } from "@ember/service";
import bodyClass from "discourse/helpers/body-class";
import isBlogTopic from "../../lib/is-blog-topic";
import isMobileDisabled from "../../lib/is-mobile-disabled";

const SIZE_CLASSES = {
  imageFull: "--blog-image-full-width",
  imageCentered: "--blog-image-centered",
  noImage: "--blog-no-images",
};

const POSITION_CLASSES = {
  aboveTitle: "--blog-image-above-title",
  belowTitle: "--blog-image-below-title",
};

export default class BlogCssClasses extends Component {
  static shouldRender(args) {
    return isBlogTopic(args.model, settings);
  }

  @service capabilities;

  get getSizeClass() {
    switch (settings.image_size) {
      case "full width":
        return SIZE_CLASSES.imageFull;
      case "centered":
        return SIZE_CLASSES.imageCentered;
      case "no image":
        return SIZE_CLASSES.noImage;
      default:
        return null;
    }
  }

  get getPositionClass() {
    switch (settings.image_position) {
      case "above title":
        return POSITION_CLASSES.aboveTitle;
      case "below title":
        return POSITION_CLASSES.belowTitle;
      default:
        return null;
    }
  }

  get bodyClasses() {
    let bodyClasses = [];

    if (!isMobileDisabled(this.capabilities, settings)) {
      bodyClasses.push("blog-post");
    }

    if (this.getSizeClass) {
      bodyClasses.push(this.getSizeClass);
    }
    if (this.getPositionClass) {
      bodyClasses.push(this.getPositionClass);
    }

    return bodyClasses.join(" ");
  }

  <template>{{bodyClass this.bodyClasses}}</template>
}
