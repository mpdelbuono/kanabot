// Loads all commands in the folder
var glob = require('glob');
var path = require('path');

commands = [];

// Go through each file (other than index.js) and run require() on it
console.log("Loading commands...");
glob.sync('./commands/!(index).js').forEach((file) => {
    console.log(`   Load command '${file}'`)
    commands.push(require(path.resolve(file)));
})

module.exports = commands;
