import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(PROJECT_ROOT, 'data', 'generated', 'train-classification.json');
const CLASSIFICATION_FILE = `c:\\Users\\himan\\AppData\\Roaming\\Trae\\User\\workspaceStorage\\efd6e4d858f46a7a60dbf1b1620b5cd8\\long-text\\home\\murgx49n-dnyh\\code PAS_5....txt`;

function parseClassificationCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const result = {};
  let skippedHeader = 0;

  for (const line of lines) {
    const cols = line.split(',');
    if (cols.length < 6) continue;
    const [numStr, nameCol, shortTypeCol, incExCol, longTypeCol, typeCodeCol] = cols.map((c) => c.trim());

    const trainNumber = numStr.replace(/[^0-9]/g, '');
    if (!trainNumber) {
      skippedHeader++;
      continue;
    }

    let typeCode = (typeCodeCol || '').replace(/type\s*code\s*/i, '').toUpperCase();
    if (!typeCode) {
      const st = (shortTypeCol || '').toLowerCase();
      if (st.includes('toy')) typeCode = 'TOY';
      else if (st.includes('exp') || longTypeCol.toLowerCase().includes('express')) typeCode = 'EXP';
      else typeCode = 'PAS';
    }

    const include = incExCol.toLowerCase() === 'include';

    result[trainNumber] = {
      n: nameCol,
      t: shortTypeCol,
      lt: longTypeCol,
      tc: typeCode,
      in: include,
    };
  }

  const counts = {};
  for (const v of Object.values(result)) {
    counts[v.tc] = (counts[v.tc] || 0) + 1;
    if (v.in === false) counts.excluded = (counts.excluded || 0) + 1;
  }
  console.log(`Parsed: ${Object.keys(result).length} entries. Type breakdown:`, counts);
  return result;
}

const data = parseClassificationCsv(CLASSIFICATION_FILE);
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(data));
console.log(`Saved classification lookup -> ${OUT_FILE}`);
