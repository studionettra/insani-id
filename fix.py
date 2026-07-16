import os, re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the import
    content = re.sub(r"import (Admin|App)Layout from '[^']+';\n", '', content)
    content = re.sub(r'import (Admin|App)Layout from "[^"]+";\n', '', content)

    # Find component name
    match = re.search(r'export default function (\w+)', content)
    if not match: return
    comp_name = match.group(1)

    # Find Head title
    title_match = re.search(r'<Head title=\"([^\"]+)\"', content)
    title = title_match.group(1) if title_match else comp_name

    # Replace <AdminLayout> or <AppLayout> with <>
    # and </AdminLayout> or </AppLayout> with </>
    content = re.sub(r'<(Admin|App)Layout.*?>', '<>', content, count=1)
    parts = re.split(r'</(?:Admin|App)Layout>', content)
    if len(parts) > 1:
        content = '</>'.join(parts[:-1]) + parts[-1]

    # Append layout config
    if comp_name + '.layout' not in content:
        href = '#'
        if 'Programs' in filepath: href = '/admin/programs'
        elif 'Disbursements' in filepath: href = '/admin/disbursements'
        elif 'Donation' in filepath: href = '/admin/donations'
        elif 'Comments' in filepath: href = '/admin/comments'
        elif 'Reports' in filepath: href = '/admin/reports'
        elif 'Users' in filepath: href = '/admin/users'
        
        layout_str = f'''\n{comp_name}.layout = {{
    breadcrumbs: [
        {{
            title: '{title}',
            href: '{href}',
        }},
    ],
}};
'''
        content += layout_str

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Processed {filepath}')

base_dir = 'resources/js/pages/Admin'
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
