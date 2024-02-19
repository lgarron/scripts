#!/usr/bin/env bun

import { argv } from "bun";
import { JSDOM } from "jsdom";

const dom = new JSDOM(
  `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf8">
  <title>Index</title>
  <!-- From: https://github.com/lgarron/minimal-html-style (v1.0.0) -->
  <meta name="viewport" content="width=device-width, initial-scale=0.75">
  <style>
    html {
      font-family: -apple-system, Roboto, Ubuntu, Tahoma, sans-serif;
      font-size: 1.25rem; padding: 2em;
      display: grid; justify-content: center;
    }
    body { width: 100%; max-width: 40em; margin: 0; }
    @media (prefers-color-scheme: dark) {
      html { background: #000D; color: #EEE; }
      a { color: #669df5; }
      a:visited { color: #af73d5; }
    }
  </style>
</head>

<body>
  <!--h1></h1-->
  <p>Files</p>
  <ul>
  </ul>
</body>

</html>
`,
);

const { document, XMLSerializer } = dom.window;

const ul = document.querySelector("ul");
let firstChild = true;
for (const fileName of argv.slice(2)) {
  ul.append("  ");
  if (firstChild) {
    firstChild = false;
  } else {
    ul.append("  ");
  }
  const li = ul.appendChild(document.createElement("li"));
  const a = li.appendChild(document.createElement("a"));
  a.href = fileName; // TODO: `happy-dom` should be handling this properly. 😣
  const code = a.appendChild(document.createElement("code"));
  code.textContent = fileName;
  ul.append("\n");
}
ul.append("  ");

console.log(new XMLSerializer().serializeToString(document));
