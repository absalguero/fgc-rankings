const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Pass through the images folder and CSS folder to the output
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

  // Load events.json manually and add it as global data
  eleventyConfig.addGlobalData("events", () => {
    const eventsPath = path.join(__dirname, "events.json");
    try {
      const data = fs.readFileSync(eventsPath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error loading events.json:", err);
      return [];
    }
  });

  return {
    dir: {
      input: ".",           // Your source files root (where your index.njk is)
      includes: "_includes", // Where your layouts like layout.njk live
      data: "_data",         // Tell Eleventy to look for data files in the _data folder
      output: "_site"        // Default output folder
    }
  };
};
