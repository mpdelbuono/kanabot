require('mocha')
var expect = require('chai').expect

const MockCommandHandler = function() {
}

MockCommandHandler.prototype.notify = function(message) {
    if (this.message) throw new Error("multiple calls to notify() detected");
    this.message = message;
}

describe("AlwaysNotifyStrategy", function() {
    beforeEach(function() {
        var AlwaysNotifyStrategy = require("../AlwaysNotifyStrategy.js");
        this.strategy = new AlwaysNotifyStrategy();
    })

    describe("#register(CommandHandler)", function() {
        it("Reports a TypeError if a null CommandHandler is provided", function() {
            expect(() => this.strategy.register(null)).to.throw(TypeError)
        });

        it("Reports a TypeError if an undefined CommandHandler is provided", function() {
            expect(() => this.strategy.register(undefined)).to.throw(TypeError)
        });
    });

    describe("#notify(message)", function() {
        it("Does not fail if no CommandHandlers have been provided", function() {
            this.strategy.notify("");
        });

        it("Sends the message to all registered CommandHandlers exactly once", function() {
            const msg = "日本語"
            handlers = [
                new MockCommandHandler(),
                new MockCommandHandler(),
                new MockCommandHandler()
            ];

            handlers.forEach((handler) => this.strategy.register(handler));
            this.strategy.notify(msg);
            handlers.forEach((handler) => expect(handler.message).to.equal(msg))
        });
    });
});