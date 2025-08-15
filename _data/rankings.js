const EleventyFetch = require("@11ty/eleventy-fetch");
const { parse } = require('csv-parse'); // Updated import to use the named export directly.

module.exports = async function() {
  // Define the public URL for your Google Sheet, exported as a CSV.
  // The 'output=csv' parameter is crucial for getting the raw data.
  const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBIqTU9Vjqm4lAYt4gGj4QMaxG4eXSsgbDzi2GVHVvrZX0Dba6b1_SlyrVI9ARnlG-xc_b0NVq5lmU/pub?gid=1862929315&single=true&output=csv';

  try {
    console.log("Fetching Street Fighter 6 rankings data...");

    // Use EleventyFetch to get the data. It handles caching for you.
    // This prevents hitting the Google Sheets API on every single build.
    const csvText = await EleventyFetch(sheetURL, {
      duration: "1h", // Cache the data for one hour.
      type: "text", // The response is plain text (CSV).
      fetchOptions: {
        headers: {
          // It's good practice to provide a User-Agent to avoid being blocked.
          'User-Agent': 'Mozilla/5.0 (compatible; Eleventy/1.0; +https://www.11ty.dev/)'
        }
      }
    });

    // Parse the CSV data using csv-parse.
    // The `sync` option is the default behavior, so we can use the main parse function.
    // 'columns: true' uses the first row as headers for the object keys.
    // 'skip_empty_lines: true' ignores any blank rows.
    const data = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    // The data is now an array of objects.
    // The keys are the column headers from your CSV: 'Rank', 'Rank Change', 'Player', etc.
    // Your Nunjucks template is expecting keys like `player.Rank_Change`.
    // The following `map` function transforms the data to match your template's expectations.
    const players = data.map(row => ({
      Rank: row['Rank'],
      Rank_Change: row['Rank Change'],
      Player: row['Player'],
      Character: row['Main Character'],
      Region: row['Region'],
      Points: row['Points'],
    }));

    console.log("Successfully fetched and parsed rankings data.");
    
    // Return the data to Eleventy. The file name 'rankings.js'
    // makes this available as the `rankings` global variable in your templates.
    // We limit the players to 25, as in your original code.
    return { players: players.slice(0, 25) };

  } catch (error) {
    console.error("Error fetching or parsing rankings data:", error);
    // Return an empty object on error to prevent the build from failing.
    return { players: [] };
  }
};
