const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
    // Pass through the images, css, and js folders to the output directory
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");

    return {
        dir: {
            input: ".", // Your source files root
            includes: "_includes", // Where your layouts like layout.njk live
            data: "_data", // Tell Eleventy to look for data files here
            output: "_site" // Default output folder
        }
    };
};