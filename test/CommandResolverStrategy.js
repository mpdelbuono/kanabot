require('mocha')
var expect = require('chai').expect

// Mock command for returning from factories
var MockCommand = function(callback = null) {
    this.callback = callback;
    this.execute = function() {
        console.log("callback");
        if (this.callback) {
            this.callback();
        }
    }
}

describe("CommandResolverStrategy", function() {
    beforeEach(function() {
        var CommandResolverStrategy = require("../CommandResolverStrategy.js");
        this.strategy = new CommandResolverStrategy();
    });

    describe("#register(factory)", function() {
        it ("Registers a factory for subsequent search", function() {
            return new Promise((done) => {
                const result = new MockCommand();
                var AlwaysMatchesFactory = function() {
                    this.matches = function(msg) {
                        done();
                        return false;
                    };
                };

                this.strategy.notify("") // should not be a problem
                this.strategy.register(new AlwaysMatchesFactory());
                this.strategy.notify("")
            });
        });

        it ("Reports an error if the factory is null", function() {
            expect(() => this.strategy.register(null)).to.throw(TypeError);
        });

        it ("Reports an error if the factory is undefined", function() {
            expect(() => this.strategy.register(undefined)).to.throw(TypeError);
        })
    });

    describe("#notify(msg)", function() {
        it ("Selects the correct factory on a given search", function() {
            return new Promise((done) => {
                var result = new MockCommand();
                var AlwaysMatchesFactory = function() {
                    this.matches = function(msg) {
                        return true;
                    }

                    this.create = function(msg) {
                        done();
                        return new MockCommand();
                    }
                }

                var NeverMatchesFactory = function() {
                    this.matches = function(msg) {
                        return false;
                    }

                    this.create = function(msg) {
                        throw new Error("incorrect factory called");
                    }
                }

                this.strategy.register(new NeverMatchesFactory());
                this.strategy.register(new AlwaysMatchesFactory());
                this.strategy.register(new NeverMatchesFactory());
                this.strategy.notify("");
            });
        });

        it ("Provides the message to the factory object during match", function() {
            var capturedValue = undefined;
            var SampleFactory = function() {
                this.matches = function(msg) {
                    capturedValue = msg;
                    return true;
                }

                this.create = function(msg) { 
                    return new MockCommand();
                }
            }

            this.strategy.register(new SampleFactory());
            expect(capturedValue).to.be.undefined;
            expect(this.strategy.notify("日本語")).to.not.be.null;
            expect(capturedValue).to.equal("日本語");
        });

        it ("Provides the message to the factory object during creation", function() {
            var capturedValue = undefined;
            var SampleFactory = function() {
                this.matches = function(msg) {
                    return true;
                }

                this.create = function(msg) { 
                    capturedValue = msg;
                    return new MockCommand();
                }
            }

            this.strategy.register(new SampleFactory());
            expect(capturedValue).to.be.undefined;
            this.strategy.notify("日本語")
            expect(capturedValue).to.equal("日本語");
        });

        it ("Does not fail with no factories registered", function() {
            this.strategy.notify("");
        });

        it ("Calls matches() exactly once", function() {
            return new Promise((done) => {
                var SampleFactory = function() {
                    this.matches = function(msg) {
                        done();
                        return false;
                    }
                }
                this.strategy.register(new SampleFactory());
                this.strategy.notify("");
            });
        });

        it ("Calls create() exactly once", function() {
            return new Promise((done) => {
                var SampleFactory = function() {
                    this.matches = function(msg) {
                        return true;
                    }
                    this.create = function(msg) {
                        done();
                        return new MockCommand();
                    }
                }
                this.strategy.register(new SampleFactory());
                this.strategy.notify("");
            });
        });

        it ("Calls execute() on the returned command", function() {
            return new Promise((done) => {
                var SampleFactory = function() {
                    this.matches = function(msg) {
                        return true;
                    }
                    this.create = function(msg) {
                        return new MockCommand(done);
                    }
                }
                this.strategy.register(new SampleFactory());
                this.strategy.notify("");
            });
        })

    });
});