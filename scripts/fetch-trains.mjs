import fs from 'fs';
import path from 'path';
import https from 'https';

const urls = [
    { url: 'https://railradar.in/trains/type/vande-bharat-express', cat: 'vande-bharat' },
    { url: 'https://railradar.in/trains/type/shatabdi-express', cat: 'shatabdi' },
    { url: 'https://railradar.in/trains/type/rajdhani-express', cat: 'rajdhani' },
    { url: 'https://railradar.in/trains/type/duronto-express', cat: 'duronto' },
    { url: 'https://railradar.in/trains/type/garib-rath-express', cat: 'garib-rath' },
    { url: 'https://railradar.in/trains/type/jan-shatabdi-express', cat: 'jan-shatabdi' },
    { url: 'https://railradar.in/trains/premium', cat: 'premium' },
    { url: 'https://railradar.in/trains/passenger', cat: 'passenger' },
    { url: 'https://railradar.in/trains/express', cat: 'express' },
    { url: 'https://railradar.in/trains/special', cat: 'special' }
];

// parse time string "3:15 PM" to "15:15"
function parseTime(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let [_, h, m, ampm] = match;
    h = parseInt(h);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
}

// parse duration "5h 30m" to minutes
function parseDuration(durStr) {
    if (!durStr) return null;
    let min = 0;
    const hMatch = durStr.match(/(\d+)h/);
    if (hMatch) min += parseInt(hMatch[1], 10) * 60;
    const mMatch = durStr.match(/(\d+)m/);
    if (mMatch) min += parseInt(mMatch[1], 10);
    return min;
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    let allTrains = new Map();

    for (const { url, cat } of urls) {
        console.log(`Fetching ${url}...`);
        try {
            const html = await fetchUrl(url);
            
            // extract blocks
            const regex = /href="\/train-status\/(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                const trainNum = match[1];
                const block = match[2];
                
                const typeMatch = block.match(/<span class="text-\[10px\][^>]*>([^<]+)<\/span>/);
                const nameMatch = block.match(/<h3 class="text-xs[^>]*>([^<]+)<\/h3>/);
                const timesMatch = [...block.matchAll(/<div class="text-base font-semibold[^>]*>([^<]+)<\/div>/g)];
                const codesMatch = [...block.matchAll(/<span class="font-medium text-foreground[^>]*>([^<]+)<\/span>/g)];
                const namesMatch = [...block.matchAll(/<span class="text-muted-foreground[^>]*>([^<]+)<\/span>/g)];
                const durationMatch = block.match(/<span class="text-\[11px\][^>]*>([^<]+)<\/span>/);
                const distanceMatch = block.match(/<span class="text-\[10px\][^>]*>([\d\.]+)<!-- -->\s*km<\/span>/);

                const train = {
                    number: trainNum,
                    name: nameMatch ? nameMatch[1].trim() : '',
                    type: typeMatch ? typeMatch[1].trim() : '',
                    originCode: codesMatch[0] ? codesMatch[0][1].trim() : '',
                    originName: namesMatch[0] ? namesMatch[0][1].trim() : '',
                    destCode: codesMatch[1] ? codesMatch[1][1].trim() : '',
                    destName: namesMatch[1] ? namesMatch[1][1].trim() : '',
                    departureTime: timesMatch[0] ? parseTime(timesMatch[0][1].trim()) : '',
                    arrivalTime: timesMatch[1] ? parseTime(timesMatch[1][1].trim()) : '',
                    durationMinutes: durationMatch ? parseDuration(durationMatch[1].trim()) : 0,
                    distanceKm: distanceMatch ? parseFloat(distanceMatch[1].trim()) : 0,
                    category: cat
                };

                if (!allTrains.has(train.number)) {
                    allTrains.set(train.number, train);
                }
            }
        } catch (e) {
            console.error(`Error fetching ${url}: ${e.message}`);
        }
    }

    const trains = Array.from(allTrains.values());
    console.log(`Extracted ${trains.length} total trains.`);
    
    // Breakdown by category
    const breakdown = {};
    for (const t of trains) {
        breakdown[t.category] = (breakdown[t.category] || 0) + 1;
    }
    console.log("Breakdown:", breakdown);

    const outPath = 'e:\\routewise\\data\\generated\\trains.json';
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(trains, null, 2));
    console.log(`Saved to ${outPath}`);
}

run();
