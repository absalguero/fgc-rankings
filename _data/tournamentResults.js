const EleventyFetch = require("@11ty/eleventy-fetch");

// Corrected URL for the tournament results sheet
const tournamentSheetURL = "https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=332201631";

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
        const values = [];
        let inQuote = false;
        let currentCell = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuote = !inQuote;
            else if (char === ',' && !inQuote) {
                values.push(currentCell.trim());
                currentCell = '';
            } else currentCell += char;
        }
        values.push(currentCell.trim());
        const cleanValues = values.map(v => v.replace(/"/g, ''));
        const row = {};
        headers.forEach((header, i) => {
            row[header] = cleanValues[i];
        });
        return row;
    });
    return data;
}

module.exports = async function() {
    try {
        const csvBuffer = await EleventyFetch(tournamentSheetURL, {
            duration: "1d",
            type: "text",
            directory: ".cache",
        });

        const csvText = csvBuffer.toString('utf8');
        const allData = parseCSV(csvText);

        return {
            tournaments: allData
        };
    } catch (error) {
        console.error("Error fetching or parsing results data:", error);
        return {
            tournaments: []
        };
    }
};