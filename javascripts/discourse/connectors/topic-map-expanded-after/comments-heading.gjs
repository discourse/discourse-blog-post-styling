import Component from "@glimmer/component";
import { i18n } from "discourse-i18n";

export default class CommentsHeading extends Component {
  static shouldRender(args, context) {
    if (!context.capabilities.viewport.sm && !settings.mobile_enabled) {
      return false;
    }
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  <template>
    <div class="comments-heading">
      <h2>{{i18n (themePrefix "blog_post_styling.comments_heading")}}</h2>
    </div>
  </template>
}
