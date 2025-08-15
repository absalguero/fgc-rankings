const EleventyFetch = require("@11ty/eleventy-fetch");
const { parse } = require('csv-parse/sync'); // Using the synchronous version for simplicity and reliability.

module.exports = async function() {
  const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBIqTU9Vjqm4lAYt4gGj4QMaxG4eXSsgbDzi2GVHVvrZX0Dba6b1_SlyrVI9ARnlG-xc_b0NVq5lmU/pub?gid=1862929315&single=true&output=csv';

  try {
    console.log("Fetching Street Fighter 6 rankings data...");

    const csvText = await EleventyFetch(sheetURL, {
      duration: "1h",
      type: "text",
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Eleventy/1.0; +https://www.11ty.dev/)'
        }
      }
    });

    // --- START DEBUGGING ---
    // Log the raw CSV text to the console.
    // This helps confirm that the fetch request was successful.
    console.log("--- Raw CSV Text ---");
    console.log(csvText);
    console.log("--------------------");
    // --- END DEBUGGING ---
    
    // Parse the CSV data.
    const data = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    // --- START DEBUGGING ---
    // Log the parsed data.
    // This helps confirm that the parsing worked correctly and shows the object keys.
    console.log("--- Parsed Data (First 3 Rows) ---");
    console.log(data.slice(0, 3));
    console.log("----------------------------------");
    // --- END DEBUGGING ---

    // IMPORTANT: Ensure the keys used below ('Rank Change', 'Main Character')
    // exactly match the column headers in your Google Sheet, including case and spacing.
    const players = data.map(row => ({
      Rank: row['Rank'],
      Rank_Change: row['Rank Change'],
      Player: row['Player'],
      Character: row['Main Character'],
      Region: row['Region'],
      Points: row['Points'],
    }));

    console.log("Successfully fetched and parsed rankings data.");
    
    return { players: players.slice(0, 25) };

  } catch (error) {
    console.error("Error fetching or parsing rankings data:", error);
    return { players: [] };
  }
};
