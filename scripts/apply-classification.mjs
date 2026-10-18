import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_ROOT = path.join(__dirname, '..');
const TRAINS_FILE = path.join(PROJECT_ROOT, 'data', 'generated', 'trains.json');
const CLASSIFICATION_FILE = `c:\\Users\\himan\\AppData\\Roaming\\Trae\\User\\workspaceStorage\\efd6e4d858f46a7a60dbf1b1620b5cd8\\long-text\\home\\murgx49n-dnyh\\code PAS_5....txt`;

function parseClassificationCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const byNumber = new Map();
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

    const typeCode = (typeCodeCol.replace(/type\s*code\s*/i, '') || shortTypeCol || '').toUpperCase();
    const includeFlag = incExCol.toLowerCase() === 'include';

    const entry = {
      trainNumber,
      name: nameCol,
      shortType: shortTypeCol,
      include: includeFlag,
      classification: incExCol.toLowerCase(),
      longTypeName: longTypeCol,
      typeCode,
    };

    if (!byNumber.has(trainNumber)) byNumber.set(trainNumber, []);
    byNumber.get(trainNumber).push(entry);
  }

  console.log(`Parsed classification entries: ${byNumber.size} unique train numbers (from ${lines.length} lines, ${skippedHeader} skipped)`);
  return byNumber;
}

function resolveClassification(existing, entries) {
  const ent = entries && entries.length > 0 ? entries[0] : null;
  if (!ent) return existing;

  let category = existing.category || 'passenger';

  if (ent.typeCode === 'TOY') category = 'toy-train';
  else if (ent.typeCode === 'PAS') category = 'passenger';
  else if (ent.typeCode === 'EXP') {
    if (!category || category === 'passenger') category = 'express';
  }

  return {
    ...existing,
    category,
    typeCode: ent.typeCode || existing.typeCode,
    longTypeName: ent.longTypeName || existing.longTypeName,
    shortTypeName: ent.shortType || existing.shortTypeName,
    includeInSearch: typeof existing.includeInSearch === 'boolean' ? existing.includeInSearch : ent.include,
  };
}

function run() {
  const classification = parseClassificationCsv(CLASSIFICATION_FILE);
  const trains = JSON.parse(fs.readFileSync(TRAINS_FILE, 'utf8'));

  let matched = 0;
  let excluded = 0;
  let categorized = 0;

  for (const t of trains) {
    const num = (t.number || '').toString().replace(/[^0-9]/g, '');
    const entries = classification.get(num);
    if (entries) {
      matched++;
      const beforeCat = t.category;
      Object.assign(t, resolveClassification(t, entries));
      if (beforeCat !== t.category) categorized++;
      if (t.includeInSearch === false) excluded++;
    }
  }

  const out = [];
  for (const t of trains) {
    if (t.includeInSearch === false) {
      out.push({ ...t, _note: 'classification-excluded' });
    } else {
      out.push(t);
    }
  }

  fs.writeFileSync(TRAINS_FILE, JSON.stringify(out, null, 2));

  const breakdown = {};
  for (const t of out) {
    const c = t.category || 'unknown';
    breakdown[c] = (breakdown[c] || 0) + 1;
  }

  console.log(`\nTrains processed: ${trains.length}`);
  console.log(`Matched classification: ${matched} (${Math.round((matched / trains.length) * 100)}%)`);
  console.log(`Category updated: ${categorized}`);
  console.log(`Marked exclude: ${excluded}`);
  console.log(`Category breakdown:`, breakdown);
  console.log(`Saved to ${TRAINS_FILE}`);
}

run();
