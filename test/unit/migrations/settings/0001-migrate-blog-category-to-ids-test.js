import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-migrate-blog-category-to-ids";

module(
  "Blog Post Styling | Unit | Migrations | Settings | 0001-migrate-blog-category-to-ids",
  function () {
    test("migrates single slug to id", function (assert) {
      const settings = new Map(Object.entries({ blog_category: "blog" }));
      const helpers = {
        getCategoryIdBySlug: (slug) => (slug === "blog" ? 5 : null),
      };

      const result = migrate(settings, helpers);

      assert.strictEqual(result.get("blog_category"), "5");
    });

    test("migrates multiple comma-separated slugs to pipe-separated ids", function (assert) {
      const settings = new Map(
        Object.entries({ blog_category: "blog,tech-blog" })
      );
      const helpers = {
        getCategoryIdBySlug(slug) {
          const map = { blog: 5, "tech-blog": 12 };
          return map[slug] || null;
        },
      };

      const result = migrate(settings, helpers);

      assert.strictEqual(result.get("blog_category"), "5|12");
    });

    test("filters out slugs that do not match any category", function (assert) {
      const settings = new Map(
        Object.entries({ blog_category: "blog,nonexistent,tech-blog" })
      );
      const helpers = {
        getCategoryIdBySlug(slug) {
          const map = { blog: 5, "tech-blog": 12 };
          return map[slug] || null;
        },
      };

      const result = migrate(settings, helpers);

      assert.strictEqual(result.get("blog_category"), "5|12");
    });

    test("handles empty blog_category value", function (assert) {
      const settings = new Map(Object.entries({ blog_category: "" }));
      const helpers = { getCategoryIdBySlug: () => null };

      const result = migrate(settings, helpers);

      assert.strictEqual(result.get("blog_category"), "");
    });

    test("does nothing when blog_category is not set", function (assert) {
      const settings = new Map();
      const helpers = { getCategoryIdBySlug: () => null };

      const result = migrate(settings, helpers);

      assert.false(result.has("blog_category"));
    });

    test("trims whitespace around slugs", function (assert) {
      const settings = new Map(
        Object.entries({ blog_category: "blog , tech-blog" })
      );
      const helpers = {
        getCategoryIdBySlug(slug) {
          const map = { blog: 5, "tech-blog": 12 };
          return map[slug] || null;
        },
      };

      const result = migrate(settings, helpers);

      assert.strictEqual(result.get("blog_category"), "5|12");
    });
  }
);
