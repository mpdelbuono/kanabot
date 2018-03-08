// Basic command for testing response
var pingMatcher = RegExp("^~ping$");
var Command = function() {
    this.matches = function(message) {
        return pingMatcher.test(message.content);
    }

    this.create = function(message) {
        return new MessageReplier(message);
    }

    this.notify = function() {}
}

var MessageReplier = function(message) {
    this.message = message;
}

MessageReplier.prototype.execute = function() {
    this.message.reply("~pong")
                .then(() => console.log(`replied to ping from ${this.message.author.tag}`))
}

module.exports = new Command();
