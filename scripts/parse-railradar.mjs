/**
 * Parse RailRadar HTML pages to extract train data.
 * Fetches all 10 category pages and produces data/generated/trains.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data', 'generated', 'trains.json');

const URLS = [
  { url: 'https://railradar.in/trains/type/vande-bharat-express', category: 'vande-bharat' },
  { url: 'https://railradar.in/trains/type/shatabdi-express', category: 'shatabdi' },
  { url: 'https://railradar.in/trains/type/rajdhani-express', category: 'rajdhani' },
  { url: 'https://railradar.in/trains/type/duronto-express', category: 'duronto' },
  { url: 'https://railradar.in/trains/type/garib-rath-express', category: 'garib-rath' },
  { url: 'https://railradar.in/trains/type/jan-shatabdi-express', category: 'jan-shatabdi' },
  { url: 'https://railradar.in/trains/premium', category: 'premium' },
  { url: 'https://railradar.in/trains/express', category: 'express' },
  { url: 'https://railradar.in/trains/special', category: 'special' },
];

function parse12hTo24h(timeStr) {
  if (!timeStr) return '';
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return timeStr.trim();
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function parseDuration(durStr) {
  if (!durStr) return 0;
  let mins = 0;
  const hm = durStr.match(/(\d+)\s*h/);
  const mm = durStr.match(/(\d+)\s*m/);
  if (hm) mins += parseInt(hm[1], 10) * 60;
  if (mm) mins += parseInt(mm[1], 10);
  return mins;
}

function extractTrains(html, category) {
  const trains = [];
  
  // Split by train status links
  const blocks = html.split(/(?=<a[^>]*href="\/train-status\/)/g).slice(1);
  
  for (const block of blocks) {
    try {
      const numMatch = block.match(/href="\/train-status\/(\d+)"/);
      if (!numMatch) continue;
      
      const monoMatch = block.match(/font-mono font-bold[^>]*>(\d+)<\/span>/);
      const typeMatch = block.match(/select-none shrink-0">(.*?)<\/span>/);
      const nameMatch = block.match(/<h3[^>]*>(.*?)<\/h3>/s);
      
      // Times
      const timeMatches = [...block.matchAll(/tabular-nums tracking-tight"[^>]*>(?:<span>)?([\d:]+\s*[AP]M)(?:<\/span>)?<\/div>/g)];
      
      // Station codes
      const codeMatches = [...block.matchAll(/font-medium text-foreground">(.*?)<\/span>/g)];
      const nameMatches2 = [...block.matchAll(/text-muted-foreground">(.*?)<\/span>/g)];
      
      // Duration
      const durMatch = block.match(/text-\[11px\][^>]*tabular-nums">(.*?)<\/span>/);
      
      // Distance
      const distMatch = block.match(/([\d.]+)(?:<!--\s*-->)?\s*km/);
      
      if (monoMatch && nameMatch) {
        const rawName = nameMatch[1].replace(/<!--.*?-->/g, '').trim();
        trains.push({
          number: monoMatch[1],
          name: rawName,
          type: typeMatch ? typeMatch[1].trim() : category,
          category,
          originCode: codeMatches[0] ? codeMatches[0][1] : '',
          originName: nameMatches2[0] ? nameMatches2[0][1] : '',
          destCode: codeMatches[1] ? codeMatches[1][1] : '',
          destName: nameMatches2[1] ? nameMatches2[1][1] : '',
          departureTime: parse12hTo24h(timeMatches[0]?.[1] || ''),
          arrivalTime: parse12hTo24h(timeMatches[1]?.[1] || ''),
          durationMinutes: parseDuration(durMatch?.[1] || ''),
          distanceKm: distMatch ? parseFloat(distMatch[1]) : 0,
        });
      }
    } catch (e) {
      // skip malformed blocks
    }
  }
  
  return trains;
}

async function fetchPage(url) {
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for ${url}`);
      return '';
    }
    return await res.text();
  } catch (e) {
    console.error(`  Error fetching ${url}: ${e.message}`);
    return '';
  }
}

async function main() {
  const allTrains = [];
  const seen = new Set();
  
  for (const { url, category } of URLS) {
    const html = await fetchPage(url);
    if (!html) continue;
    
    const trains = extractTrains(html, category);
    console.log(`  Extracted ${trains.length} trains from ${category}`);
    
    for (const t of trains) {
      if (!seen.has(t.number)) {
        seen.add(t.number);
        allTrains.push(t);
      }
    }
  }
  
  console.log(`\nTotal unique trains: ${allTrains.length}`);
  
  // Category breakdown
  const cats = {};
  for (const t of allTrains) {
    cats[t.category] = (cats[t.category] || 0) + 1;
  }
  console.log('Category breakdown:', cats);
  
  fs.writeFileSync(OUT, JSON.stringify(allTrains, null, 2));
  console.log(`Written to ${OUT}`);
}

main().catch(console.error);
