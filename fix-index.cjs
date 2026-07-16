const fs = require('fs');
let content = fs.readFileSync('resources/js/pages/Admin/Users/Index.tsx', 'utf8');

// Fix TableHead
content = content.replace(/TableHead/g, 'TableCell isHeader');

// Fix routes
content = content.replace(/admin\.users\.index\.url\(\)/g, '"/admin/users"');
content = content.replace(/admin\.users\.store\.url\(\)/g, '"/admin/users"');
content = content.replace(/admin\.users\.update\.url\(\{ user: editingUser\.id \}\)/g, '`/admin/users/${editingUser.id}`');
content = content.replace(/admin\.users\.destroy\.url\(\{ user: user\.id \}\)/g, '`/admin/users/${user.id}`');

fs.writeFileSync('resources/js/pages/Admin/Users/Index.tsx', content);
