const EleventyFetch = require("@11ty/eleventy-fetch");

const sheetURL = 'https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=1862929315';

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

module.exports = async function() {
    try {
        // =================================================================
        // CONFIGURATION: These values are now set correctly for your sheet.
        // =================================================================
        const DATE_ROW_INDEX = 1;    // The row number containing the date
        const DATE_COLUMN_INDEX = 7; // The position of the date in that row
        const HEADER_ROW_INDEX = 0;  // The row number with your player headers
        // =================================================================
        
        const csvText = await EleventyFetch(sheetURL, {
            duration: "1h",
            type: "text",
            directory: ".cache",
        });

        const rows = csvText.trim().split('\n');
        
        const dateRow = parseCsvRow(rows[DATE_ROW_INDEX]);
        const lastUpdated = dateRow[DATE_COLUMN_INDEX] || 'N/A';
        
        const headers = parseCsvRow(rows[HEADER_ROW_INDEX]);

        const players = rows.slice(HEADER_ROW_INDEX + 1).map(rowStr => {
            const values = parseCsvRow(rowStr);
            const player = {};
            headers.forEach((header, i) => {
                player[header] = values[i];
            });
            return player;
        }).filter(p => p.Player && p.Player.trim() !== '');

        return {
            players: players,
            lastUpdated: lastUpdated
        };

    } catch (error) {
        console.error("Eleventy encountered an error fetching ranking data:", error);
        return { players: [], lastUpdated: 'N/A' };
    }
};