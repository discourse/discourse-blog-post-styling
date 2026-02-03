import Component from "@glimmer/component";

export const SUMMARY_REGEX = /\[summary\]([\s\S]*?)\[\/summary\]/i;

export default class BlogSummary extends Component {
  get summary() {
    const cooked = this.args.topic?.firstPost?.()?._result?.cooked;
    if (!cooked) {
      return;
    }

    const summaryMatch = cooked.match(SUMMARY_REGEX);
    if (summaryMatch) {
      return summaryMatch[1].trim();
    }
  }

  <template>
    {{#if this.summary}}
      <p class="blog-post__summary">
        {{this.summary}}
      </p>
    {{/if}}
  </template>
}
