const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// Override fence renderer to handle glsl-canvas blocks
const defaultFenceRenderer = md.renderer.rules.fence.bind(md.renderer.rules);
md.renderer.rules.fence = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const info = token.info ? token.info.trim() : '';

  if (info === 'glsl-canvas') {
    env.hasShaders = true;
    const code = token.content;
    return '<div class="shader-container">'
      + '<div class="shader-editor-pane">'
      + '<div class="shader-editor-header">GLSL Fragment Shader</div>'
      + '<textarea class="shader-editor" spellcheck="false">'
      + md.utils.escapeHtml(code)
      + '</textarea>'
      + '</div>'
      + '<div class="shader-canvas-pane">'
      + '<canvas class="shader-canvas" width="600" height="400"></canvas>'
      + '<button class="shader-pause-btn" title="Pause">&#9208;</button>'
      + '<div class="shader-status"><span class="shader-status-dot"></span><span class="shader-status-text">Running</span></div>'
      + '</div>'
      + '<script type="x-shader/x-fragment" class="shader-source">'
      + code
      + '<\/script>'
      + '</div>\n';
  }

  return defaultFenceRenderer(tokens, idx, options, env, self);
};


module.exports = function renderMarkdown(content) {
  const env = { hasShaders: false };
  return { content: md.render(content, env), hasShaders: env.hasShaders };
};
