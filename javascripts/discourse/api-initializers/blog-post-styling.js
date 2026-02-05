import { apiInitializer } from "discourse/lib/api";
import { SUMMARY_REGEX } from "../components/blog-summary";
import isBlogTopic from "../lib/is-blog-topic";

function removeSummaryTags(firstPost) {
  if (!firstPost) {
    return;
  }
  firstPost.innerHTML = firstPost.innerHTML.replace(SUMMARY_REGEX, "");
}

function wrapFirstLetter(firstPost) {
  if (!firstPost || firstPost.querySelector(".blog-post__drop-cap")) {
    return;
  }
  const paragraphs = firstPost.querySelectorAll("p");
  for (const p of paragraphs) {
    const text = p.textContent.trim();
    if (text) {
      p.innerHTML = p.innerHTML.replace(
        /(^|>)([\p{L}\p{N}])/u,
        "$1<span class='blog-post__drop-cap'>$2</span>"
      );
      return;
    }
  }
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

      removeSummaryTags(elem);

      if (settings.dropcap_enabled) {
        wrapFirstLetter(elem);
      }
    },
    { onlyStream: true }
  );
});
