const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
    // Pass through the images, css, and js folders to the output directory
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");

    // Load events.json manually and add it as global data
    eleventyConfig.addGlobalData("events", () => {
        const eventsPath = path.join(__dirname, "_data", "events.json");
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
            input: ".", // Your source files root
            includes: "_includes", // Where your layouts like layout.njk live
            data: "_data", // Tell Eleventy to look for data files here
            output: "_site" // Default output folder
        }
    };
};