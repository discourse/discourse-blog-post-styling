import { module, test } from "qunit";
import removeSummary from "../../../javascripts/discourse/lib/remove-summary";

const SUMMARY_REGEX = /\[summary\]([\s\S]*?)\[\/summary\]/i;

module("Blog Post Styling | Unit | remove summary", function () {
  test("preserves decorator targets when there is no summary", function (assert) {
    const element = document.createElement("div");
    element.innerHTML = '<div class="mermaid-wrapper"></div>';
    const target = element.firstElementChild;

    removeSummary(element, SUMMARY_REGEX);

    assert.strictEqual(element.firstElementChild, target);
    assert.strictEqual(target.parentNode, element);
  });

  test("removes a formatted summary while preserving neighboring targets", function (assert) {
    const element = document.createElement("div");
    element.innerHTML =
      '<div class="mermaid-wrapper"></div><p>Before [summary]A <strong>formatted</strong> summary.[/summary] After</p><div class="mermaid-wrapper"></div>';
    const targets = Array.from(element.querySelectorAll(".mermaid-wrapper"));
    const paragraph = element.querySelector("p");

    removeSummary(element, SUMMARY_REGEX);

    assert.strictEqual(element.firstElementChild, targets[0]);
    assert.strictEqual(element.lastElementChild, targets[1]);
    assert.strictEqual(element.querySelector("p"), paragraph);
    assert.strictEqual(paragraph.textContent, "Before  After");
    assert.strictEqual(element.querySelector("strong"), null);
  });

  test("removes a summary spanning paragraphs in a detached document", function (assert) {
    const detachedDocument = document.implementation.createHTMLDocument("");
    const element = detachedDocument.createElement("div");
    element.innerHTML =
      '<p>[summary]First paragraph.</p><p>Second paragraph.[/summary]</p><div class="mermaid-wrapper"></div>';
    const target = element.lastElementChild;

    removeSummary(element, SUMMARY_REGEX);
    document.adoptNode(element);

    assert.strictEqual(element.textContent, "");
    assert.strictEqual(element.lastElementChild, target);
    assert.strictEqual(target.ownerDocument, document);
  });

  test("leaves an incomplete summary unchanged", function (assert) {
    const element = document.createElement("div");
    element.innerHTML = "<p>[summary]Unclosed summary.</p>";
    const paragraph = element.firstElementChild;

    removeSummary(element, SUMMARY_REGEX);

    assert.strictEqual(element.firstElementChild, paragraph);
    assert.strictEqual(element.textContent, "[summary]Unclosed summary.");
  });
});
