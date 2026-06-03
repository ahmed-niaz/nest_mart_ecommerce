const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Fix ৳{var).toFixed(2)} to ৳{Number(var).toFixed(2)}
            const regex = /৳\{([a-zA-Z0-9_.]+)\)\.toFixed/g;
            if (regex.test(content)) {
                content = content.replace(regex, "৳{Number($1).toFixed");
                changed = true;
            }
            
            // Fix any stray `$৳` to just `৳`
            if (content.includes('$৳')) {
                content = content.replace(/\$৳/g, '৳');
                changed = true;
            }

            // Fix stray ${
            if (content.includes('${(parseFloat(item.price)')) {
               content = content.replace(/\$\{\(parseFloat/g, '৳{(parseFloat');
               changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed ${fullPath}`);
            }
        }
    }
}

fixFiles(path.join(__dirname, '../client/src'));
