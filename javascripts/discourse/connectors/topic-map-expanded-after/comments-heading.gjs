import Component from "@glimmer/component";
import { i18n } from "discourse-i18n";
import isBlogTopic from "../../lib/is-blog-topic";
import isMobileDisabled from "../../lib/is-mobile-disabled";

export default class CommentsHeading extends Component {
  static shouldRender(args, context) {
    if (isMobileDisabled(context.capabilities, settings)) {
      return false;
    }

    return isBlogTopic(args.topic, settings);
  }

  <template>
    <div class="comments-heading">
      <h2>{{i18n (themePrefix "blog_post_styling.comments_heading")}}</h2>
    </div>
  </template>
}
