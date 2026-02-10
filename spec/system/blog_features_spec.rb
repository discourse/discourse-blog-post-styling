# frozen_string_literal: true

RSpec.describe "Blog post features", system: true do
  fab!(:tag) { Fabricate(:tag, name: "blog") }
  fab!(:image_upload) { Fabricate(:image_upload, width: 1000, height: 1000) }
  fab!(:topic) { Fabricate(:topic, tags: [tag], image_upload_id: image_upload.id) }
  fab!(:user)

  let(:topic_page) { PageObjects::Pages::Topic.new }
  let!(:theme) { upload_theme_component }

  before do
    theme.update_setting(:blog_tag, "blog")
    theme.update_setting(:image_position, "below title")
    theme.save!
    sign_in(user)
  end

  describe "drop cap (wrap first letter)" do
    fab!(:post) { Fabricate(:post, topic:, raw: "Lorem ipsum dolor sit amet.") }

    it "wraps first letter with drop cap class when enabled" do
      theme.update_setting(:dropcap_enabled, true)
      theme.save!

      topic_page.visit_topic(topic)
      expect(page).to have_css(".blog-post__drop-cap")
    end

    it "does not wrap first letter when dropcap is disabled" do
      theme.update_setting(:dropcap_enabled, false)
      theme.save!

      topic_page.visit_topic(topic)
      expect(page).to have_no_css(".blog-post__drop-cap")
    end
  end

  describe "summary tag removal" do
    fab!(:post) do
      Fabricate(
        :post,
        topic:,
        raw: "Introduction text.\n\n[summary]This is the summary.[/summary]\n\nMore content here.",
      )
    end

    it "removes [summary] tags from the post content" do
      topic_page.visit_topic(topic)

      within("#post_1 .cooked") do
        expect(page).to have_no_text("[summary]")
        expect(page).to have_no_text("[/summary]")
      end
    end
  end

  describe "summary component" do
    fab!(:post) do
      Fabricate(
        :post,
        topic:,
        raw:
          "Introduction text.\n\n[summary]This is the blog summary.[/summary]\n\nMore content here.",
      )
    end

    it "displays summary component when image position is below title" do
      theme.update_setting(:image_position, "below title")
      theme.save!

      topic_page.visit_topic(topic)
      expect(page).to have_css(".blog-post__summary", text: "This is the blog summary.")
    end

    it "does not display summary component when image position is above title" do
      theme.update_setting(:image_position, "above title")
      theme.save!

      topic_page.visit_topic(topic)
      expect(page).to have_no_css(".blog-post__summary")
    end
  end
end
