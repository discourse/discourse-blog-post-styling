import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { concat } from "@ember/helper";

export default class BlogImage extends Component {
  get topic() {
    return this.args.topic;
  }

  get imageURL() {
    return this.topic?.thumbnails?.[0]?.url;
  }

  <template>
    {{#if this.imageURL}}
      <div class="blog-image-container">
        <div
          class="blog-post__image"
          style={{htmlSafe (concat "background-image: url(" this.imageURL ")")}}
        >
          ></div>
      </div>
    {{/if}}
  </template>
}
