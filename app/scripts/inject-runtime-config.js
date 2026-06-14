import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '..', '..', 'docs', 'env-config.js');

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

const lines = [
  '// Generated at deploy time — do not commit',
  `// Generated: ${new Date().toISOString()}`,
  ...keys.map((key) => `window.ENV_${key} = ${JSON.stringify(readEnv(key))};`),
  '',
];

writeFileSync(outputPath, lines.join('\n'));
console.log(`Wrote ${outputPath}`);
console.log(`Firebase API key present: ${Boolean(readEnv('FIREBASE_API_KEY'))}`);
console.log(`Firebase database URL present: ${Boolean(readEnv('FIREBASE_DATABASE_URL'))}`);
