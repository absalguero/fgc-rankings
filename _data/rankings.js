const EleventyFetch = require("@11ty/eleventy-fetch");

const sheetURL = 'https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=1862929315';

// A robust CSV parsing function to handle commas within quoted fields
function parseCSV(text) {
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(row => {
        const player = {};
        const values = [];
        let inQuote = false;
        let currentCell = '';

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        values.push(currentCell.trim());
        
        const cleanValues = values.map(v => v.replace(/"/g, ''));

        headers.forEach((header, i) => {
            player[header] = cleanValues[i];
        });
        return player;
    });
}

// A dedicated function to parse a single row correctly
function parseSingleRow(rowString) {
    const values = [];
    let inQuote = false;
    let currentCell = '';

    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            values.push(currentCell.trim());
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    values.push(currentCell.trim());
    return values.map(v => v.replace(/"/g, ''));
}


module.exports = async function() {
    try {
        const csvText = await EleventyFetch(sheetURL, {
            duration: "1h",
            type: "text",
            directory: ".cache",
        });

        // First, parse the main list of players
        const players = parseCSV(csvText);

        // Then, get the specific value for the date from the H2 cell
        const rows = csvText.trim().split('\n');
        const secondRowValues = parseSingleRow(rows[1]);
        const dateValue = secondRowValues[7]; // H2 is the 8th column, which is index 7
        const lastUpdated = dateValue || 'N/A';

        return {
            players: players,
            lastUpdated: lastUpdated
        };

    } catch (error) {
        console.error("Eleventy encountered an error fetching data:", error);
        return {
            players: [],
            lastUpdated: 'N/A'
        };
    }
};