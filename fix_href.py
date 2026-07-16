import os, re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace `href: someName(),` with `href: someName.url(),`
    # Also handle without comma: `href: someName()`
    # And handle `asChild` logic if any, but the match is just the href line.
    
    # We will match `href: (\w+)\(\)` and replace with `href: \1.url()`
    new_content = re.sub(r'href:\s*(\w+)\(\)', r'href: \1.url()', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {filepath}')

base_dirs = ['resources/js/components', 'resources/js/pages', 'resources/js/layouts']
for d in base_dirs:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                process_file(os.path.join(root, file))
