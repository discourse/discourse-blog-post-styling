# frozen_string_literal: true

RSpec.describe "Blog image styling with tags", system: true do
  fab!(:tag) { Fabricate(:tag, name: "blog") }
  fab!(:image_upload) { Fabricate(:image_upload, width: 1000, height: 1000) }
  fab!(:topic) { Fabricate(:topic, tags: [tag], image_upload_id: image_upload.id) }
  fab!(:post) { Fabricate(:post, topic:) }
  fab!(:user)

  let(:topic_page) { PageObjects::Pages::Topic.new }
  let!(:theme) { upload_theme_component }

  before do
    theme.update_setting(:blog_tag, "blog")
    theme.save!
    sign_in(user)
  end

  it "displays blog image container when topic has matching tag" do
    topic_page.visit_topic(topic)
    expect(page).to have_css(".blog-image-container")
  end

  it "does not display blog image container when topic tag does not match" do
    theme.update_setting(:blog_tag, "different-tag")
    theme.save!

    topic_page.visit_topic(topic)
    expect(page).to have_no_css(".blog-image-container")
  end
end
