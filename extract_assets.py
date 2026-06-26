from pathlib import Path

root = Path('.')
index = root / 'index.html'
text = index.read_text(encoding='utf-8')
start = text.find('<style>')
end = text.find('</style>', start)
if start == -1 or end == -1:
    raise RuntimeError('Style block not found')
css = text[start + len('<style>'):end].lstrip('\n')
text = text[:start] + '<link rel="stylesheet" href="assets/css/style.css">\n' + text[end + len('</style>'):]

sstart = text.rfind('<script>')
send = text.rfind('</script>')
if sstart == -1 or send == -1 or sstart >= send:
    raise RuntimeError('Script block not found')
js = text[sstart + len('<script>'):send].lstrip('\n')
text = text[:sstart] + '<script src="assets/js/main.js"></script>\n' + text[send + len('</script>'):]

(css_dir := root / 'assets' / 'css').mkdir(parents=True, exist_ok=True)
(js_dir := root / 'assets' / 'js').mkdir(parents=True, exist_ok=True)

(css_dir / 'style.css').write_text(css, encoding='utf-8')
(js_dir / 'main.js').write_text(js, encoding='utf-8')
index.write_text(text, encoding='utf-8')
print('done')
