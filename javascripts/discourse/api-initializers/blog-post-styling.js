import { apiInitializer } from "discourse/lib/api";
import { SUMMARY_REGEX } from "../components/blog-summary";
import isBlogTopic from "../lib/is-blog-topic";
import isMobileDisabled from "../lib/is-mobile-disabled";

const SIZE_CLASSES = {
  imageFull: "--blog-image-full-width",
  imageCentered: "--blog-image-centered",
  noImage: "--blog-no-images",
};

const POSITION_CLASSES = {
  aboveTitle: "--blog-image-above-title",
  belowTitle: "--blog-image-below-title",
};

function removeSummaryTags(firstPost) {
  if (!firstPost) {
    return;
  }
  firstPost.innerHTML = firstPost.innerHTML.replace(SUMMARY_REGEX, "");
}

function getSizeClass() {
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

function getPositionClass() {
  switch (settings.image_position) {
    case "above title":
      return POSITION_CLASSES.aboveTitle;
    case "below title":
      return POSITION_CLASSES.belowTitle;
    default:
      return null;
  }
}

function removeStyleClasses() {
  document.body.classList.remove(
    ...Object.values(SIZE_CLASSES),
    ...Object.values(POSITION_CLASSES),
    "viewing-first-post"
  );
}

function wrapFirstLetter(firstPost) {
  if (!firstPost || firstPost.querySelector(".blog-post__drop-cap")) {
    return;
  }
  firstPost.innerHTML = firstPost.innerHTML.replace(
    /<p([^>]*)>((?:<(?!\/)[^>]+>)*)([\p{L}\p{N}])/iu,
    "<p$1>$2<span class='blog-post__drop-cap'>$3</span>"
  );
}

export default apiInitializer((api) => {
  let postState = null;

  function isFirstPost(post) {
    if (!post) {
      return;
    }

    const firstPost = post.post_number === 1;

    if (postState === firstPost) {
      return;
    }
    postState = firstPost;
    document.body.classList.toggle("viewing-first-post", firstPost);
  }

  api.onAppEvent("topic:current-post-changed", ({ post }) => {
    isFirstPost(post);
  });

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

  api.onPageChange(() => {
    const controller = api.container.lookup("controller:topic");
    const topic = controller?.model;

    if (!isBlogTopic(topic, settings)) {
      document.body.classList.remove("blog-post");
      removeStyleClasses();
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

      const capabilities = api.container.lookup("service:capabilities");
      if (isMobileDisabled(capabilities, settings)) {
        document.body.classList.remove("blog-post");
        return;
      }

      document.body.classList.add("blog-post");

      const sizeClass = getSizeClass();
      const positionClass = getPositionClass();
      if (sizeClass) {
        document.body.classList.add(sizeClass);
      }
      if (positionClass) {
        document.body.classList.add(positionClass);
      }

      if (settings.dropcap_enabled) {
        wrapFirstLetter(elem);
      }
    },
    { onlyStream: true }
  );
});
