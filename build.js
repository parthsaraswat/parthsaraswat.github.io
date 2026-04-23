#!/usr/bin/env node
// Build markdown posts into HTML and regenerate blog.html.
//
// Usage:
//   npm run build             Render posts-md/*.md -> posts/*.html, rebuild blog.html
//   npm run new "Post Title"  Scaffold a new posts-md/<slug>.md file

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, basename, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { Marked } from "marked";
import { markedSmartypants } from "marked-smartypants";
import hljs from "highlight.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const POSTS_MD = join(ROOT, "posts-md");
const POSTS_HTML = join(ROOT, "posts");
const TEMPLATES = join(ROOT, "templates");

const SITE_URL = "https://psaraswat.com";
const SITE_TITLE = "Parth Saraswat";
const SITE_DESC = "Writing about tech, life, and the things I learn along the way.";

const MONTHS_LONG = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun",
                      "Jul","Aug","Sep","Oct","Nov","Dec"];

// Split already-highlighted HTML into lines while keeping <span> tags balanced
// across line breaks. hljs occasionally emits spans that wrap multiple lines
// (multi-line strings, comments) — naive splitting on \n would produce broken
// HTML, so we close/reopen open spans at each line boundary.
function linifyHighlighted(html) {
  const lines = [];
  const open = []; // stack of opening <span ...> tags
  let cur = "";
  for (let i = 0; i < html.length; ) {
    const ch = html[i];
    if (ch === "\n") {
      cur += "</span>".repeat(open.length);
      lines.push(cur);
      cur = open.join("");
      i++;
      continue;
    }
    if (ch === "<") {
      const end = html.indexOf(">", i);
      if (end < 0) { cur += ch; i++; continue; }
      const tag = html.slice(i, end + 1);
      cur += tag;
      if (tag.startsWith("</")) open.pop();
      else if (tag.startsWith("<span")) open.push(tag);
      i = end + 1;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.length > 0 || lines.length === 0) lines.push(cur);
  return lines;
}

function renderCodeBlock({ text, lang }) {
  const raw = (lang || "").trim();
  // Allow "python:filename.py" or "python title=filename.py" after the fence.
  const [langTok, ...rest] = raw.split(/\s+/);
  const langPart = langTok.split(":")[0];
  const fileFromColon = langTok.includes(":") ? langTok.slice(langTok.indexOf(":") + 1) : "";
  const titleMatch = rest.join(" ").match(/title=(\S+)/);
  const filename = fileFromColon || (titleMatch ? titleMatch[1] : "");

  const language = langPart && hljs.getLanguage(langPart) ? langPart : "plaintext";
  const highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value;
  const lines = linifyHighlighted(highlighted);
  while (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  const gutterWidth = Math.max(2, String(lines.length).length);
  const body = lines
    .map((line, i) => `<span class="ln">${String(i + 1).padStart(gutterWidth, " ")}</span>${line}`)
    .join("\n");

  const langLabel = `<span class="c-code-lang">${escapeHtml(langPart || "plain")}</span>`;
  const fileLabel = filename ? `<span class="c-code-file">${escapeHtml(filename)}</span>` : "";
  return `<figure class="c-code"><div class="c-code-bar">${langLabel}${fileLabel}</div><pre><code class="hljs language-${escapeHtml(language)}">${body}</code></pre></figure>\n`;
}

const marked = new Marked({ gfm: true })
  .use(markedSmartypants())
  .use({
    renderer: {
      code(token) { return renderCodeBlock(token); },
    },
  });

// --- helpers ---------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function unescapeHtml(s) {
  return String(s)
    .replaceAll("&mdash;", "\u2014").replaceAll("&ndash;", "\u2013")
    .replaceAll("&lsquo;", "\u2018").replaceAll("&rsquo;", "\u2019")
    .replaceAll("&ldquo;", "\u201C").replaceAll("&rdquo;", "\u201D")
    .replaceAll("&hellip;", "\u2026")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDate(raw) {
  // Accepts YYYY-MM-DD (from frontmatter) or Date objects (gray-matter auto-parses).
  if (raw instanceof Date) return raw;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw).trim());
  if (!m) throw new Error(`Invalid date: ${raw}. Use YYYY-MM-DD.`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

const d_year  = d => d.getUTCFullYear();
const d_month = d => d.getUTCMonth();
const d_day   = d => d.getUTCDate();
const dateLong  = d => `${MONTHS_LONG[d_month(d)]} ${d_day(d)}, ${d_year(d)}`;
const dateShort = d => `${MONTHS_SHORT[d_month(d)]} ${d_day(d)}`;

function highlightTitle(title, highlight) {
  const phrase = highlight || title.split(" ").slice(-1)[0];
  const idx = title.lastIndexOf(phrase);
  if (idx === -1) return escapeHtml(title);
  return escapeHtml(title.slice(0, idx))
       + `<span class="c-hl">${escapeHtml(phrase)}</span>`
       + escapeHtml(title.slice(idx + phrase.length));
}

function indent(text, pad) {
  // Pad every non-empty line, but leave lines that START inside a <pre>
  // block untouched — whitespace there is significant.
  let depth = 0;
  const out = [];
  for (const line of text.split("\n")) {
    const startDepth = depth;
    depth += (line.match(/<pre(\s|>)/g) || []).length;
    depth -= (line.match(/<\/pre>/g) || []).length;
    if (startDepth > 0) out.push(line);
    else out.push(line.length ? pad + line : line);
  }
  return out.join("\n");
}

// --- markdown -> post.html -------------------------------------------------

function renderMarkdownPost(mdPath) {
  const raw = readFileSync(mdPath, "utf8");
  const { data: meta, content } = matter(raw);
  for (const k of ["title", "date", "description"]) {
    if (meta[k] == null) throw new Error(`${basename(mdPath)}: missing frontmatter field '${k}'`);
  }

  const slug = basename(mdPath, extname(mdPath));
  const date = parseDate(meta.date);
  const bodyHtml = indent(marked.parse(content).trim(), "          ");

  const tmpl = readFileSync(join(TEMPLATES, "post.html"), "utf8");
  const out = tmpl
    .replaceAll("{{title_plain}}", escapeHtml(meta.title))
    .replaceAll("{{title_html}}", highlightTitle(meta.title, meta.highlight))
    .replaceAll("{{description}}", escapeHtml(meta.description))
    .replaceAll("{{date_long}}", dateLong(date))
    .replaceAll("{{body}}", bodyHtml);

  writeFileSync(join(POSTS_HTML, `${slug}.html`), out);
  console.log(`  wrote posts/${slug}.html`);
  return { slug, title: meta.title, date, description: meta.description };
}

// --- blog.html index merge -------------------------------------------------
// Parse the existing blog.html and preserve its entry blocks verbatim (so
// hand-tuned excerpts, badges, etc. survive rebuilds). We only REPLACE the
// entry for a slug that has a markdown source, or INSERT new entries.

function parseExistingEntries(html) {
  // Extract the body of <div>...entries...</div> inside <section class="c-blog">.
  const m = /<section class="c-blog">[\s\S]*?<p class="c-blog-lede">[\s\S]*?<\/p>\s*<div>([\s\S]*?)<\/div>\s*<\/section>/.exec(html);
  if (!m) return [];
  const body = m[1];

  const entries = [];
  let currentYear = null;
  // Capture leading spaces so we can dedent preserved blocks to column 0.
  const rowRe = /( *)(<summary class="c-blog-year">(\d{4})[\s\S]*?<\/summary>|<div class="c-blog-year">(\d{4})<\/div>|<a class="c-post-row" href="posts\/([^"]+)\.html">[\s\S]*?<\/a>)/g;
  let match;
  while ((match = rowRe.exec(body)) !== null) {
    const indentStr = match[1];
    const payload = match[2];
    if (match[3] || match[4]) {
      currentYear = +(match[3] || match[4]);
    } else {
      const slug = match[5];
      const dateM = /<div class="c-post-date">([A-Za-z]+)\s+(\d{1,2})<\/div>/.exec(payload);
      const titleM = /<h2 class="c-post-h">([\s\S]*?)<\/h2>/.exec(payload);
      const descM = /<p class="c-post-ex">([\s\S]*?)<\/p>/.exec(payload);
      if (!dateM || currentYear == null) continue;
      const monthIdx = MONTHS_SHORT.findIndex(mm => mm.toLowerCase() === dateM[1].toLowerCase());
      if (monthIdx < 0) continue;
      entries.push({
        slug,
        date: new Date(Date.UTC(currentYear, monthIdx, +dateM[2])),
        title: titleM ? unescapeHtml(titleM[1]) : slug,
        description: descM ? unescapeHtml(descM[1]) : "",
        block: dedent(indentStr + payload),
      });
    }
  }
  return entries;
}

function dedent(block) {
  const lines = block.split("\n");
  const widths = lines.filter(l => l.trim().length).map(l => (l.match(/^ */)[0].length));
  const pad = Math.min(...widths);
  return lines.map(l => l.slice(pad)).join("\n");
}

function buildNewEntryBlock(p) {
  return `<a class="c-post-row" href="posts/${p.slug}.html">
  <div class="c-post-head">
    <h2 class="c-post-h">${escapeHtml(p.title)}</h2>
    <div class="c-post-date">${dateShort(p.date)}</div>
  </div>
  <p class="c-post-ex">${escapeHtml(p.description)}</p>
</a>`;
}

function mergePosts(mdPosts) {
  const blogPath = join(ROOT, "blog.html");
  const sourceHtml = existsSync(blogPath)
    ? readFileSync(blogPath, "utf8")
    : readFileSync(join(TEMPLATES, "blog.html"), "utf8");
  const existing = parseExistingEntries(sourceHtml);

  // Overlay markdown posts: same slug -> replace; new -> append.
  const bySlug = new Map(existing.map(e => [e.slug, e]));
  for (const p of mdPosts) {
    bySlug.set(p.slug, {
      slug: p.slug,
      date: p.date,
      title: p.title,
      description: p.description,
      block: buildNewEntryBlock(p),
    });
  }
  return [...bySlug.values()].sort((a, b) => b.date - a.date);
}

function renderBlogIndex(merged) {
  const lines = [];
  let currentYear = null;
  for (const e of merged) {
    const y = d_year(e.date);
    if (y !== currentYear) {
      if (currentYear !== null) {
        lines.push("</details>");
        lines.push("");
      }
      lines.push(`<details class="c-year-group" open>`);
      lines.push(`  <summary class="c-blog-year">${y}<span class="c-year-caret" aria-hidden="true">&#9662;</span></summary>`);
      lines.push("");
      currentYear = y;
    }
    lines.push(indent(e.block, "  "));
    lines.push("");
  }
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  if (currentYear !== null) lines.push("</details>");

  const entries = indent(lines.join("\n"), "          ");
  const tmpl = readFileSync(join(TEMPLATES, "blog.html"), "utf8");
  writeFileSync(join(ROOT, "blog.html"), tmpl.replace("{{entries}}", entries));
  console.log(`  wrote blog.html (${merged.length} posts)`);
}

// --- feed.xml --------------------------------------------------------------

function plainText(s) {
  return String(s)
    .replace(/<span\b[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderRssFeed(merged) {
  const items = merged.map(e => {
    const url = `${SITE_URL}/posts/${e.slug}.html`;
    return `    <item>
      <title>${escapeHtml(plainText(e.title))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${e.date.toUTCString()}</pubDate>
      <description>${escapeHtml(plainText(e.description))}</description>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(SITE_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeHtml(SITE_DESC)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  writeFileSync(join(ROOT, "feed.xml"), xml);
  console.log(`  wrote feed.xml (${merged.length} items)`);
}

// --- `new` subcommand ------------------------------------------------------

function scaffoldNewPost(title) {
  if (!title) {
    console.error('Usage: npm run new -- "Post Title"');
    process.exit(1);
  }
  const slug = slugify(title);
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const dst = join(POSTS_MD, `${slug}.md`);
  if (existsSync(dst)) {
    console.error(`Refusing to overwrite ${dst}`);
    process.exit(1);
  }
  const body = `---
title: ${title}
date: ${iso}
description: One-sentence summary shown on the blog index and as meta description.
---

Write your post in markdown here.
`;
  writeFileSync(dst, body);
  console.log(`Created posts-md/${slug}.md`);
}

// --- main ------------------------------------------------------------------

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "new") return scaffoldNewPost(rest.join(" "));

  if (!existsSync(POSTS_MD)) mkdirSync(POSTS_MD);

  const mdPosts = [];
  const mdFiles = readdirSync(POSTS_MD).filter(f => f.endsWith(".md")).sort();
  if (mdFiles.length) {
    console.log(`Rendering ${mdFiles.length} markdown post(s):`);
    for (const f of mdFiles) mdPosts.push(renderMarkdownPost(join(POSTS_MD, f)));
  } else {
    console.log("No markdown posts in posts-md/ yet.");
  }

  const merged = mergePosts(mdPosts);
  renderBlogIndex(merged);
  renderRssFeed(merged);
}

main();
