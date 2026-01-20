import Component from "@glimmer/component";
import Site from "discourse/models/site";
import { i18n } from "discourse-i18n";

export default class CommentsHeading extends Component {
  static shouldRender() {

    if (Site.currentProp("mobileView") && !settings.mobile_enabled) {
      return false;
    }
    // Only render if blog categories or tags are configured
    return settings.blog_category?.length > 0 || settings.blog_tag?.length > 0;
  }

  <template>
    <div class="comments-heading">
      <h2>{{i18n (themePrefix "blog_post_styling.comments_heading")}}</h2>
    </div>
  </template>
}
