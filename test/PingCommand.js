require('mocha')
var expect = require('chai').expect

var MockDiscordMessage = function(message) {
    this.content = message;
}

describe("PingCommand", function() {
    beforeEach(function() {
        process.env.npm_package_config_debug = "true";
        this.command = require("../commands/PingCommand.js");
    });

    describe("#matches(message)", function() {
        it("Always returns false if 'debug' config setting is not 'true'", function() {
            process.env.npm_package_config_debug = "false";
            expect(this.command.matches(new MockDiscordMessage("~ping"))).to.equal(false);
            process.env.npm_package_config_debug = "true";
            expect(this.command.matches(new MockDiscordMessage("~ping"))).to.equal(true);
        });

        it("Matches the exact discord message '~ping'", function() {
            expect(this.command.matches(new MockDiscordMessage("~ping"))).to.equal(true);
        });

        it("Does not match anything other than '~ping'", function() {
            expect(this.command.matches(new MockDiscordMessage(" ~ping"))).to.equal(false);
            expect(this.command.matches(new MockDiscordMessage("~ping "))).to.equal(false);
            expect(this.command.matches(new MockDiscordMessage("ping"))).to.equal(false);
        });

        it("Does not fail with unicode messages", function() {
            expect(this.command.matches(new MockDiscordMessage("日本語"))).to.equal(false);
        });

        it("Does not fail with empty messages", function() {
            expect(this.command.matches(new MockDiscordMessage(""))).to.equal(false);
        });
    });

    describe("#create(message)", function() {
        it("Provides an object with an execute() method", function() {
            expect(this.command.create(new MockDiscordMessage("~ping"))).respondsTo("execute");
        });
    });

    describe("#create(message)#execute()", function() {
        it("Calls 'reply' once with ~pong", function() {
            return new Promise((done) => {
                var message = new MockDiscordMessage("~ping");
                message.reply = function(response) {
                    expect(response).to.equal("~pong");
                    done(); 
                };
                var executor = this.command.create(message);
                expect(executor).respondsTo("execute");
                executor.execute()
            });
        });
    });
});