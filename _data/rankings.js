const EleventyFetch = require("@11ty/eleventy-fetch");
const { parse } = require('csv-parse/sync');

module.exports = async function() {
  const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-5EA7Uvl16qJolXsMR4SRAzXb6XwclnVtT92byBa34nk3WMk6qL2XG79-xF-uRg/pub?gid=1862929315&single=true&output=csv';

  // Fetch the CSV file during the build process.
  const csvText = await EleventyFetch(sheetURL, {
    duration: "1h", // Cache the data for 1 hour to prevent excessive requests
    type: "text",
    fetchOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Eleventy/1.0; +https://www.11ty.dev/)'
      }
    }
  });

  // Parse the CSV data with csv-parse
  const data = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  // Map the raw data to a clean array of objects with Nunjucks-friendly keys
  const players = data.map(row => ({
    Rank: row['Rank'],
    Rank_Change: row['Rank Change'],
    Player: row['Player'],
    Character: row['Main Character'],
    Region: row['Region'],
    Points: row['Points'],
  }));

  // Return the data with the 'players' key, limited to 25 players
  return { players: players.slice(0, 25) };
};