# frozen_string_literal: true

RSpec.describe "Blog styling with categories", system: true do
  fab!(:category)
  fab!(:image_upload) { Fabricate(:image_upload, width: 1000, height: 1000) }
  fab!(:topic) { Fabricate(:topic, category:, image_upload_id: image_upload.id) }
  fab!(:post) { Fabricate(:post, topic:) }
  fab!(:user)

  let(:topic_page) { PageObjects::Pages::Topic.new }
  let!(:theme) { upload_theme_component }

  before do
    theme.update_setting(:blog_category, category.id.to_s)
    theme.update_setting(:image_position, "below title")
    theme.save!
    sign_in(user)
  end

  it "displays blog styling when topic is in a matching category" do
    topic_page.visit_topic(topic)
    expect(page).to have_css(".blog-image-container")
  end

  it "does not display blog styling when topic is in a different category" do
    other_category = Fabricate(:category)
    other_topic = Fabricate(:topic, category: other_category, image_upload_id: image_upload.id)
    Fabricate(:post, topic: other_topic)

    topic_page.visit_topic(other_topic)
    expect(page).to have_no_css(".blog-image-container")
  end

  it "supports multiple categories" do
    second_category = Fabricate(:category)
    second_topic = Fabricate(:topic, category: second_category, image_upload_id: image_upload.id)
    Fabricate(:post, topic: second_topic)

    theme.update_setting(:blog_category, "#{category.id}|#{second_category.id}")
    theme.save!

    topic_page.visit_topic(second_topic)
    expect(page).to have_css(".blog-image-container")
  end
end
