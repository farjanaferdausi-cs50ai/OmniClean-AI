import re

with open('/tmp/ref_main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find world_map
pos = content.find('world_map')
print('world_map pos:', pos)
print(content[pos-100:pos+200])

m = re.search(r'([a-zA-Z0-9_$]+)=["`][^"`]*world_map[^"`]*["`]', content)
if m:
    var_name = m.group(1)
    print('Found var:', var_name)
    pattern = rf'\b{re.escape(var_name)}\b'
    for mat in re.finditer(pattern, content):
        idx = mat.start()
        print('=== OCCURRENCE at', idx, '===')
        print(content[max(0, idx-100):min(len(content), idx+200)])
