const { spawn } = require('child_process');
var kanaMatcher = RegExp("^~kana(?:\\s*(.+))?$");
var Command = function() {
    this.matches = function(message) {
        return kanaMatcher.test(message.content);
    }

    this.create = function(message) {
        return new MessageReplier(message);
    }

    this.notify = function() {}
}

var MessageReplier = function(message) {
    this.message = message;

    var result = kanaMatcher.exec(message);
    this.sentence = result[1];
}

MessageReplier.prototype.execute = function() {
    var message = this.message; // needed because the below lambdas will destroy 'this'

    // Call into phantomjs, pass data, and wait for response
    console.log(`Executing transliteration for ${this.sentence} (request by ${this.message.author.tag})`);
    var phantomjs = spawn("phantomjs", ["./translator-module.phantom.js"]);
    phantomjs.stdin.write(this.sentence);
    phantomjs.stdin.end();

    var result = "";
    phantomjs.stdout.on('data', (data) => {
        result = result + data;
    })
    phantomjs.on('close', (code) => {
        console.log(`Transliteration completed with code ${code}`)
        if (code != 0) {
            message.reply("Sorry, an error occurred.");
        } else {
            message.reply(result.trim());
        }
    })
}

module.exports = new Command();
