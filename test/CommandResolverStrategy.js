require('mocha')
var expect = require('chai').expect

describe("CommandResolverStrategy", function() {
    beforeEach(function() {
        var CommandResolverStrategy = require("../CommandResolverStrategy.js");
        this.strategy = new CommandResolverStrategy();
    });

    describe("#register(factory)", function() {
        it ("Registers a factory for subsequent search", function() {
            const result = new Object();
            var AlwaysMatchesFactory = function() {
                this.matches = function(msg) {
                    return true;
                };

                this.create = function(msg) {
                    return result;
                }
            };

            expect(this.strategy.create("")).to.be.null
            this.strategy.register(new AlwaysMatchesFactory());
            expect(this.strategy.create("")).to.equal(result);
        });

        it ("Reports an error if the factory is null", function() {
            expect(() => this.strategy.register(null)).to.throw(TypeError);
        });

        it ("Reports an error if the factory is undefined", function() {
            expect(() => this.strategy.register(undefined)).to.throw(TypeError);
        })
    });

    describe("#create(msg)", function() {
        it ("Selects the correct factory on a given search", function() {
            var result = new Object();
            var AlwaysMatchesFactory = function() {
                this.matches = function(msg) {
                    return true;
                }

                this.create = function(msg) {
                    return result;
                }
            }

            var NeverMatchesFactory = function() {
                this.matches = function(msg) {
                    return false;
                }

                this.create = function(msg) {
                    return new Object();
                }
            }

            this.strategy.register(new NeverMatchesFactory());
            this.strategy.register(new AlwaysMatchesFactory());
            this.strategy.register(new NeverMatchesFactory());
            expect(this.strategy.create("")).to.equal(result);
        });

        it ("Provides the message to the factory object during match", function() {
            var capturedValue = undefined;
            var SampleFactory = function() {
                this.matches = function(msg) {
                    capturedValue = msg;
                    return true;
                }

                this.create = function(msg) { 
                    return new Object();
                }
            }

            this.strategy.register(new SampleFactory());
            expect(capturedValue).to.be.undefined;
            expect(this.strategy.create("日本語")).to.not.be.null;
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
                    return new Object();
                }
            }

            this.strategy.register(new SampleFactory());
            expect(capturedValue).to.be.undefined;
            expect(this.strategy.create("日本語")).to.not.be.null;
            expect(capturedValue).to.equal("日本語");
        });

        it ("Returns null with no registered factories", function() {
            expect(this.strategy.create("")).to.be.null;
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
                this.strategy.create("");
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
                        return new Object();
                    }
                }
                this.strategy.register(new SampleFactory());
                this.strategy.create("");
            });
        });

    });
});