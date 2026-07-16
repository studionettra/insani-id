const fs = require('fs');
let content = fs.readFileSync('resources/js/components/app-sidebar.tsx', 'utf8');

// Fix routes
content = content.replace(/import \{ admin, dashboard \} from \"@\/routes\";/g, 'import { dashboard } from "@/routes";');
content = content.replace(/url: admin\.users\.index\.url\(\)/g, 'url: "/admin/users"');

fs.writeFileSync('resources/js/components/app-sidebar.tsx', content);
