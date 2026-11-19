import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const tempOutDir = path.join(rootDir, 'dist-single');
const exportDir = path.join(rootDir, 'github-pages');
const exportFile = path.join(exportDir, 'index.html');

await build({
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    assetsInlineLimit: 100 * 1024 * 1024, // Inline all artwork images cleanly inside the single file
    cssCodeSplit: false,
  },
});

let html = fs.readFileSync(path.join(tempOutDir, 'index.html'), 'utf8');

// Inline stylesheet(s)
html = html.replace(
  /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_match, href) => {
    const relPath = href.replace(/^\//, '');
    const cssPath = path.join(tempOutDir, relPath);
    if (!fs.existsSync(cssPath)) return _match;
    const css = fs.readFileSync(cssPath, 'utf8');
    return `<style>\n${css}\n</style>`;
  }
);

// Inline module script(s)
html = html.replace(
  /<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_match, src) => {
    const relPath = src.replace(/^\//, '');
    const jsPath = path.join(tempOutDir, relPath);
    if (!fs.existsSync(jsPath)) return _match;
    const js = fs.readFileSync(jsPath, 'utf8').replace(/<\/script/gi, '<\\/script');
    return `<script type="module">\n${js}\n</script>`;
  }
);

// Also remove any leftover modulepreload links pointing to /assets/
html = html.replace(/<link\s+rel="modulepreload"[^>]*>\s*/g, '');

fs.mkdirSync(exportDir, { recursive: true });
fs.writeFileSync(exportFile, html, 'utf8');
fs.rmSync(tempOutDir, { recursive: true, force: true });

const lines = html.split('\n');
const placeholderLines = [];
lines.forEach((line, idx) => {
  if (line.includes('PASTE_SMART_LINK_HERE')) {
    placeholderLines.push({ line: idx + 1, text: line.trim() });
  }
});

const stats = fs.statSync(exportFile);
console.log(`Exported single-file HTML: ${exportFile}`);
console.log(`Total size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
console.log(`Total lines: ${lines.length}`);
console.log('PASTE_SMART_LINK_HERE locations:', placeholderLines);
