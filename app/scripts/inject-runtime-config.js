import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', '..', 'docs');
const outputPath = join(docsDir, 'env-config.js');
const placeholder = '<!-- RUNTIME_CONFIG -->';

const keys = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'ADMIN_PASSWORD',
  'JESS_USERNAME',
  'JESS_PASSWORD',
  'GBTECH_USERNAME',
  'GBTECH_PASSWORD',
  'LARS_USERNAME',
  'LARS_PASSWORD',
  'DEFAULT_TENANT_ID',
  'GOOGLE_MAPS_API_KEY',
  'OPENWEATHER_API_KEY',
];

function readEnv(name) {
  return process.env[name] || process.env[`VITE_${name}`] || '';
}

const assignments = keys.map((key) => `window.ENV_${key}=${JSON.stringify(readEnv(key))};`);

const envConfigLines = [
  '// Generated at deploy time — do not commit',
  `// Generated: ${new Date().toISOString()}`,
  ...assignments,
  '',
];

writeFileSync(outputPath, envConfigLines.join('\n'));
console.log(`Wrote ${outputPath}`);

const inlineScript = `<script id="runtime-config">${assignments.join('')}</script>`;

for (const filename of ['index.html', '404.html']) {
  const htmlPath = join(docsDir, filename);
  let html = readFileSync(htmlPath, 'utf8');

  if (html.includes(placeholder)) {
    html = html.replace(placeholder, inlineScript);
  } else if (!html.includes('id="runtime-config"')) {
    html = html.replace('</head>', `  ${inlineScript}\n  </head>`);
  }

  writeFileSync(htmlPath, html);
  console.log(`Injected runtime config into ${htmlPath}`);
}

console.log(`Firebase API key present: ${Boolean(readEnv('FIREBASE_API_KEY'))}`);
console.log(`Firebase database URL present: ${Boolean(readEnv('FIREBASE_DATABASE_URL'))}`);
