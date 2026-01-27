import Component from "@glimmer/component";

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
          style="background-image: url('{{this.imageURL}}')"
        ></div>
      </div>
    {{/if}}
  </template>
}
