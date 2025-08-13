const EleventyFetch = require("@11ty/eleventy-fetch");
const Papa = require("papaparse");

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

  // Parse the CSV data
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return { players: data.slice(0, 25) };
};