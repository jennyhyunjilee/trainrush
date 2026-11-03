"""Bundle the input helpers into app.js, served by the existing Python process."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
p = root / 'app.js'
s = p.read_text()
start = '// BEGIN INPUT OPTIONS BUNDLE\n'
end = '// END INPUT OPTIONS BUNDLE\n'
if start in s:
    s = s.split(end, 1)[1]
else:
    s = re.sub(r"^import .* from './(?:input-options|input-helpers)\.js';\n", '', s, flags=re.M)
parts = []
for name in ('stations.js', 'input-helpers.js', 'input-options.js'):
    part = (root / name).read_text()
    part = re.sub(r'^import .*;\n', '', part, flags=re.M)
    part = re.sub(r'\bexport (?=const |function )', '', part)
    parts.append('// Source: ' + name + '\n' + part)
p.write_text(start + '\n'.join(parts) + end + s)
