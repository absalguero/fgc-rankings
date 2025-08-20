const EleventyFetch = require("@11ty/eleventy-fetch");
const { parse } = require('csv-parse/sync');

module.exports = async function() {
  // IMPORTANT: The gid has been updated to point to the correct tab.
  const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBIqTU9Vjqm4lAYt4gGj4QMaxG4eXSsgbDzi2GVHVvrZX0Dba6b1_SlyrVI9ARnlG-xc_b0NVq5lmU/pub?gid=332201631&single=true&output=csv';

  try {
    console.log("-------------------");
    console.log("Fetching tournament results data...");
    console.log(`Attempting to fetch from URL: ${sheetURL}`);

    const csvText = await EleventyFetch(sheetURL, {
      duration: "0s",
      type: "text",
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Eleventy/1.0; +https://www.11ty.dev/)'
        }
      }
    });

    console.log("Data fetched successfully. Now parsing...");
    
    // Parse the CSV data.
    const data = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });
    
    console.log("CSV parsed successfully.");

    // Map the data to a more readable format.
    const rows = data.map(row => ({
      Player: row['Player'],
      Event: row['Event'],
      Date: row['Date'],
      Placing: row['Placing'],
      Entrants: row['Entrants'],
    }));

    // Log the number of rows fetched to the console to confirm success.
    console.log(`Successfully parsed ${rows.length} rows.`);
    console.log("-------------------");
    
    // Return the data.
    return { rows: rows };

  } catch (error) {
    console.error("-------------------");
    console.error("Error fetching or parsing results data:");
    console.error(error);
    console.error("This is often due to an incorrect URL or the Google Sheet not being published to the web.");
    console.error("-------------------");
    return { rows: [] };
  }
};
