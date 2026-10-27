import { apiInitializer } from "discourse/lib/api";
import { SUMMARY_REGEX } from "../components/blog-summary";
import isBlogTopic from "../lib/is-blog-topic";
import removeSummary from "../lib/remove-summary";

function wrapFirstLetter(firstPost) {
  if (!firstPost || firstPost.querySelector(".blog-post__drop-cap")) {
    return;
  }

  const firstParagraph = Array.from(firstPost.querySelectorAll("p")).find(
    (p) => p.textContent.trim().length > 0
  );

  if (!firstParagraph) {
    return;
  }
  firstParagraph.innerHTML = firstParagraph.innerHTML.replace(
    /(^|>)([\p{L}\p{N}])/u,
    "$1<span class='blog-post__drop-cap'>$2</span>"
  );
}

export default apiInitializer((api) => {
  api.onAppEvent("composer:edited-post", () => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (isBlogTopic(topic, settings)) {
      const thumbnail = document.querySelector(
        ".blog-post article#post_1 .cooked > p img"
      );
      // Refresh route to reload topic data including thumbnail when thumbnail is changed
      if (
        topic?.thumbnails?.[0]?.url?.split("/")?.pop() !==
        thumbnail?.src?.split("/")?.pop()
      ) {
        window.location.reload();
      }
    }
  });

  api.decorateCookedElement(
    (elem, helper) => {
      const post = helper.model;
      if (!post || !post.firstPost) {
        return;
      }
      const topic = post.topic;

      if (!isBlogTopic(topic, settings)) {
        return;
      }

      removeSummary(elem, SUMMARY_REGEX);

      if (settings.dropcap_enabled) {
        wrapFirstLetter(elem);
      }
    },
    { onlyStream: true }
  );
});
