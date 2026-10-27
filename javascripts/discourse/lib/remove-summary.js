export default function removeSummary(element, summaryRegex) {
  if (!element) {
    return;
  }

  const match = element.textContent.match(summaryRegex);
  if (!match) {
    return;
  }

  // Keep other decorators' elements intact, including renderGlimmer targets.
  const document = element.ownerDocument;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const end = match.index + match[0].length;
  let offset = 0;
  let started = false;
  let node;

  while ((node = walker.nextNode())) {
    const nextOffset = offset + node.textContent.length;

    if (!started && match.index < nextOffset) {
      range.setStart(node, match.index - offset);
      started = true;
    }

    if (started && end <= nextOffset) {
      range.setEnd(node, end - offset);
      range.deleteContents();
      return;
    }

    offset = nextOffset;
  }
}
