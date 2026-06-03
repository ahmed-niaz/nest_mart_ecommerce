const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace JSX text dollar signs: >$ { or >${ or just >$
    // Actually, safer to replace specific patterns found in grep
    
    // Pattern: >${ -> >৳{
    content = content.replace(/>\$\{/g, '>৳{');
    
    // Pattern: \s\$\{ ->  ৳\{ (like whitespace then ${ )
    // but wait, template strings can have whitespace then ${.
    // Let's match lines that have price, total, subtotal, shippingFee, discountAmount, compareAtPrice
    
    const pricePatterns = [
      /(\$)\{Number\(/g,
      /(\$)\{parseFloat\(/g,
      /(\$)\{price\./g,
      /(\$)\{itemTotal\./g,
      /(\$)\{item\.price/g,
    ];
    
    pricePatterns.forEach(pattern => {
      content = content.replace(pattern, '৳{');
    });

    // Replace template string currency: `$${ -> `৳${
    content = content.replace(/`\$\$\{/g, '`৳${');
    
    // Replace text "Free delivery over $50"
    content = content.replace(/\$50/g, '৳50');

    // Replace USD with BDT
    content = content.replace(/USD/g, 'BDT');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
