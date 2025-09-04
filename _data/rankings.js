// _data/rankings.js
const EleventyFetch = require("@11ty/eleventy-fetch");
const fs = require("fs");
const path = require("path");

// Define the path for our reliable backup file
const CACHE_PATH = path.join(__dirname, "rankings_cache.json");

// A robust CSV parsing function to handle commas within quoted fields
function parseCsvRow(rowString) {
    if (!rowString) return [];
    const values = [];
    let inQuote = false;
    let currentCell = '';
    for (const char of rowString) {
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
            values.push(currentCell.trim().replace(/"/g, ''));
            currentCell = '';
        } else currentCell += char;
    }
    values.push(currentCell.trim().replace(/"/g, ''));
    return values;
}

// Helper function to read the backup file safely
const readFromCache = () => {
    if (fs.existsSync(CACHE_PATH)) {
        try {
            const fileContents = fs.readFileSync(CACHE_PATH, 'utf8');
            if (fileContents) {
                return JSON.parse(fileContents);
            }
        } catch (error) {
            console.error("Error reading or parsing rankings_cache.json:", error);
        }
    }
    // Return a default structure if the cache doesn't exist or is invalid
    return { lastUpdated: "N/A", players: [] };
};

// Helper function to write to the backup file
const writeToCache = (data) => {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
};

module.exports = async function() {
    const cachedData = readFromCache();

    try {
        const sheetURL = 'https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=1862929315';
        const isServing = process.env.ELEVENTY_RUN_MODE === 'serve';

        const csvText = await EleventyFetch(sheetURL, {
            duration: isServing ? "0s" : "1h",
            type: "text",
            directory: ".cache",
        });

        const rows = csvText.trim().split('\n');
        
        // Configuration for your specific sheet layout
        const DATE_ROW_INDEX = 1;
        const DATE_COLUMN_INDEX = 7;
        const HEADER_ROW_INDEX = 0;
        
        const dateRow = parseCsvRow(rows[DATE_ROW_INDEX]);
        const lastUpdated = dateRow[DATE_COLUMN_INDEX] || null;
        
        const headers = parseCsvRow(rows[HEADER_ROW_INDEX]);

        const players = rows.slice(HEADER_ROW_INDEX + 1).map(rowStr => {
            const values = parseCsvRow(rowStr);
            const player = {};
            headers.forEach((header, i) => {
                player[header] = values[i];
            });
            return player;
        }).filter(p => p.Player && p.Player.trim() !== '');

        // Sanity check: If the fetched data is empty or invalid, throw an error
        if (!lastUpdated || players.length === 0) {
            throw new Error("Fetched data from Google Sheet is empty or malformed.");
        }

        const freshData = {
            players: players,
            lastUpdated: lastUpdated
        };

        writeToCache(freshData);
        return freshData;

    } catch (error) {
        console.warn("⚠️  Eleventy fetch for rankings failed. Falling back to cached data.", error.message);
        return cachedData;
    }
};