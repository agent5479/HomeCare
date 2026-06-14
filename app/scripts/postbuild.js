import { copyFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', '..', 'docs');
const indexPath = join(docsDir, 'index.html');

if (existsSync(indexPath)) {
  copyFileSync(indexPath, join(docsDir, '404.html'));
  console.log('Created docs/404.html for GitHub Pages SPA routing');
}

writeFileSync(join(docsDir, '.nojekyll'), '');
console.log('Created docs/.nojekyll');
