# frozen_string_literal: true

describe "Blog Post Styling", type: :system do
  fab!(:user)
  fab!(:theme)
  fab!(:component) { Fabricate(:theme, component: true) }
  fab!(:blog_tag) { Fabricate(:tag, name: "blog") }
  fab!(:other_tag) { Fabricate(:tag, name: "other") }
  fab!(:image_upload)

  let(:topic_page) { PageObjects::Pages::Topic.new }

  before do
    SiteSetting.tagging_enabled = true

    component.set_field(target: :settings, name: :yaml, value: <<~YAML)
      blog_category:
        type: string
        default: ""
      blog_tag:
        type: list
        list_type: tag
        default: "blog"
      image_display_style:
        type: enum
        default: "responsive crop"
        choices:
          - responsive crop
          - center fit
      mobile_enabled:
        type: bool
        default: false
      no_images:
        type: bool
        default: false
    YAML

    component.set_field(
      target: :extra_js,
      name: "discourse/connectors/topic-above-post-stream/blog-image.gjs",
      type: :js,
      value: <<~GJS,
        import Component from "@glimmer/component";
        import Category from "discourse/models/category";

        export default class BlogImage extends Component {
          get topic() {
            return this.args.outletArgs.model;
          }

          get isBlogTopic() {
            let hasCategory = false;
            let hasTag = false;

            if (settings.no_images) {
              return false;
            }

            if (this.topic?.category_id) {
              const allowedCategories = settings.blog_category.split(",");
              const currentCategory = Category.findById(this.topic.category_id);
              const parentCategorySlug = currentCategory.parentCategory
                ? `${currentCategory.parentCategory.slug}-`
                : "";
              hasCategory = allowedCategories.some(
                (c) => c.trim() === `${parentCategorySlug}${currentCategory.slug}`
              );
            }

            if (this.topic?.tags) {
              const allowedTags = settings.blog_tag.split("|");
              hasTag = this.topic.tags.some((topicTag) => {
                // Handle both string (old format) and object (new format) tags
                const tagName = typeof topicTag === "string" ? topicTag : topicTag.name;
                return allowedTags.includes(tagName);
              });
            }

            return hasCategory || hasTag;
          }

          get imageURL() {
            return this.topic?.thumbnails?.[0]?.url;
          }

          <template>
            {{#if this.isBlogTopic}}
              {{#if this.imageURL}}
                <div class="blog-image-container">
                  <div
                    class="blog-image"
                    style="background-image: url('{{this.imageURL}}')"
                  ></div>
                </div>
              {{/if}}
            {{/if}}
          </template>
        }
      GJS
    )

    component.save!
    theme.add_relative_theme!(:child, component)
    theme.set_default!
    sign_in(user)
  end

  it "displays blog image only for topics with matching tags" do
    topic_with_blog_tag =
      Fabricate(:topic, tags: [blog_tag], image_upload_id: image_upload.id).tap do |t|
        Fabricate(:post, topic: t)
      end
    topic_with_other_tag =
      Fabricate(:topic, tags: [other_tag], image_upload_id: image_upload.id).tap do |t|
        Fabricate(:post, topic: t)
      end
    topic_with_multiple_tags =
      Fabricate(:topic, tags: [blog_tag, other_tag], image_upload_id: image_upload.id).tap do |t|
        Fabricate(:post, topic: t)
      end

    topic_page.visit_topic(topic_with_blog_tag)
    expect(topic_page).to have_topic_title(topic_with_blog_tag.title)
    expect(page).to have_css(".blog-image-container")

    topic_page.visit_topic(topic_with_other_tag)
    expect(topic_page).to have_topic_title(topic_with_other_tag.title)
    expect(page).to have_no_css(".blog-image-container")

    topic_page.visit_topic(topic_with_multiple_tags)
    expect(topic_page).to have_topic_title(topic_with_multiple_tags.title)
    expect(page).to have_css(".blog-image-container")
  end
end
