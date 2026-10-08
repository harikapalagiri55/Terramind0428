const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'client', 'dist');
const dest = path.join(__dirname, 'dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('✓ Successfully mirrored client/dist -> root ./dist for Vercel deployment');
} else {
  console.error('Error: client/dist directory does not exist');
  process.exit(1);
}
