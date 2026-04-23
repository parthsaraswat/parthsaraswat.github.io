---
title: Example Post
date: 2026-04-21
description: A long-form test post exercising every markdown element — headings, lists, links, images, blockquotes, code, tables, and more.
highlight: Post
---

This post exists as a stress test for the markdown → HTML pipeline. If the styles in `styles.css` cover everything below, every future post will render cleanly with no hand-editing.

## Paragraphs and inline formatting

A normal paragraph can contain **bold text**, *italic text*, ***both at once***, and [inline links](https://example.com) that should pick up the accent color. "Smart quotes" and em-dashes — like this one — get converted automatically by the SmartyPants pass.

Inline `code` should sit in a subtle chip so it's visually distinct from surrounding prose without being loud. A second paragraph gives the first-letter dropcap something to apply to only on the opening paragraph — subsequent paragraphs shouldn't repeat it.

## Headings

### This is an H3

H3 is the first sub-heading under H2. It should feel lighter than H2 but still structural.

#### This is an H4

H4 is rare but should still render legibly when it appears.

## Unordered lists

- First item, plain
- Second item with **emphasis** mid-line
- Third item with a nested list below:
  - Nested item one
  - Nested item two with `inline code`
  - Nested item three
- Fourth item, back at the top level

## Ordered lists

The accent-colored numerals should sit in the left gutter, mono-spaced:

1. Step one — sketch the problem on paper first.
2. Step two — write a failing test that captures the smallest possible version.
3. Step three — make it pass with the ugliest code you can stand.
4. Step four — refactor while the test is green.
5. Step five — commit, then walk away for an hour.

Ordered lists can also nest:

1. Outer step one
   1. Inner step A
   2. Inner step B
2. Outer step two
3. Outer step three

## Blockquotes

> A blockquote renders in italic serif with an accent-colored left border. It's the right place for a pulled-out idea that deserves its own visual weight — a line from a book, a line from a conversation, a line you want the reader to slow down over.

Back to regular prose after the quote.

## Code blocks

A JavaScript block:

```js
function fibonacci(n) {
  if (n < 2) return n;
  let [a, b] = [0, 1];
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

console.log(fibonacci(10)); // 55
```

A Python block to check a second language renders identically:

```python
def fibonacci(n):
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fibonacci(10))  # 55
```

A shell block:

```bash
npm run build
npm run new -- "My next post"
```

A block with no language, to confirm the fallback path works:

```
plain preformatted text
  preserves   its   spacing
and line breaks exactly
```

## Images

Single image, inline in the flow:

![Alt text for the header image](images/example-post/header.png)

## Horizontal rule

Below this line is a horizontal rule. It should render as a hairline in the rule color.

---

Above this line was a horizontal rule. Prose resumes normally.

## Tables

| Column A | Column B | Column C |
| -------- | -------- | -------- |
| Cell one | Cell two | Cell three |
| Another  | Row two  | Right-most |
| Last     | Row      | Here |

## Links

A final check: prose links like [this one to Wikipedia](https://en.wikipedia.org) should be visually distinct — accent color with a subtle underline — so they read as affordances without shouting.

That's it. Run `npm run build` and this file becomes `posts/example-post.html`.
