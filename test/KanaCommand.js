require('mocha')
var expect = require('chai').expect

var MockDiscordMessage = function(message, channel = "#foo") {
    this.content = message;
    this.cleanContent = message;
    this._typing = false;
    this.channel = {
        name: channel,
        startTyping: function() { this._typing = true; },
        stopTyping: function() { this._typing = false; }
    }

    this.author = {
        name: "Shirik",
        tag: "Shirik#1234"
    }

    this.reply = function(message) {
        this._capturedReply = message;

        // Notify the promise that the reply has come back, if necessary
        if (this._pendingPromiseCallback) {
            this._pendingPromiseCallback(this._capturedReply);
        }
    }

    this._pendingPromiseCallback = undefined;
    // Waits for a reply, returning a promise that resolves upon call to this.reply().
    this.getNextReply = function() {
        if (this._capturedReply == undefined) {
            return new Promise((done) => {
                this._pendingPromiseCallback = done;
            });
        } else {
            return new Promise((done) => done(this._capturedReply));
        }
    }
}

describe("KanaCommand", function() {
    beforeEach(function() {
        this.command = require("../commands/KanaCommand.js");
    })
    describe("#matches(message)", function() {
        it("matches all messages starting with ~kana", function() {
            expect(this.command.matches(new MockDiscordMessage("~kana 日本語"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~kana　日本語"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~kana"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~kanano"))).to.equal(false);
        });

        it("matches all messages starting with ~rom", function() {
            expect(this.command.matches(new MockDiscordMessage("~rom 日本語"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~rom　日本語"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~rom"))).to.equal(true);
            expect(this.command.matches(new MockDiscordMessage("~romno"))).to.equal(false);
        })
        it("Does not match messages containing Japanese characters without ~kana or ~rom", function() {
            expect(this.command.matches(new MockDiscordMessage("日本語です"))).to.be.false;
            expect(this.command.matches(new MockDiscordMessage("ひらがな"))).to.be.false;
            expect(this.command.matches(new MockDiscordMessage("カタカナ"))).to.be.false;
            expect(this.command.matches(new MockDiscordMessage("漢字"))).to.be.false;
            expect(this.command.matches(new MockDiscordMessage("English Text"))).to.be.false;
        });
        it("Does not fail if no previous message was received on a check-last message", function() {
            expect(() => this.command.matches(new MockDiscordMessage("~kana"))).to.not.throw();
        });
    });

    describe("#create(message)#execute()", function() {
        describe("if using ~kana with no arguments", function() {
            this.timeout(10000);

            it("Reports an error if no previous Kanji message was received", function() {
                var message = new MockDiscordMessage("~kana");
                expect(this.command.matches(message)).to.equal(true);
                this.command.create(message).execute();
                expect(message._capturedReply).to.contain("Error");
            });
            it("Replies with an appropriate hiragana transliteration for the previous kanji message", function() {
                var message1 = new MockDiscordMessage("日本語です");
                var message2 = new MockDiscordMessage("~kana");
                this.command.notify(message1);
                expect(this.command.matches(message1)).to.be.false;
                this.command.notify(message2);
                expect(this.command.matches(message2)).to.be.true;
                this.command.create(message2).execute();
                return message2.getNextReply().then((result) => expect(result).to.equal("にほんごです"));
            });
            it("Includes katakana where it was in the previous kanji message");
            it("Skips over non-kanji messages", function() {
                var message1 = new MockDiscordMessage("日本語です");
                var message2 = new MockDiscordMessage("English desu!");
                var message3 = new MockDiscordMessage("~kana");
                this.command.notify(message1);
                expect(this.command.matches(message1)).to.be.false;
                this.command.notify(message2);
                expect(this.command.matches(message2)).to.be.false;
                this.command.notify(message3);
                expect(this.command.matches(message3)).to.be.true;
                this.command.create(message3).execute();
                return message3.getNextReply().then((result) => expect(result).to.equal("にほんごです"));
            });
            it("Does not confuse messages in different channels", function() {
                var message1 = new MockDiscordMessage("一番", "#foo");
                var message2 = new MockDiscordMessage("二番", "#bar");
                var message3 = new MockDiscordMessage("~kana", "#foo");
                var message4 = new MockDiscordMessage("~kana", "#bar");
                this.command.notify(message1);
                this.command.notify(message2);
                this.command.notify(message3);
                this.command.create(message3).execute();
                this.command.create(message4).execute();
                return Promise.all([message3.getNextReply(), message4.getNextReply()]).then(
                    function(values) {
                        expect(values[0]).to.equal("いちばん");
                        expect(values[1]).to.equal("にばん");
                    });

            });
        });

        describe("if using ~kana with an argument", function() {
            this.timeout(10000);

            it("Replies with an error message if it does not appear to be Japanese", function() {
                var message = new MockDiscordMessage("~kana hello");
                this.command.notify(message);
                expect(this.command.matches(message)).to.be.true;
                this.command.create(message).execute();
                return message.getNextReply().then((result) => expect(result).to.contain("Error"));
            });
            it("Replies with an appropriate hiragana transliteration", function() {
                var message1 = new MockDiscordMessage("日本語です"); // to verify previous message is not interacting
                var message2 = new MockDiscordMessage("~kana 当たりですか？");
                this.command.notify(message1);
                this.command.notify(message2);
                expect(this.command.matches(message2)).to.be.true;
                this.command.create(message2).execute();
                return message2.getNextReply().then((result) => expect(result).to.equal("あたりです　か？"));
            });
            it("Includes katakana where it was in the original message");
        });

        describe("if using ~rom", function() {
            this.timeout(10000);

            it("Replies with romaji instead of kana", function() {
                var message = new MockDiscordMessage("~rom 日本語です");
                this.command.notify(message);
                expect(this.command.matches(message));
                this.command.create(message).execute();
                return message.getNextReply().then((result) => expect(result).to.equal("Nihongodesu"));
            });

            it("Does not contain katakana");
        })
    });

    describe("#_convertRomajiToKana(text)", function() {
        it("Converts a series of romaji characters into hiragana equivalents", function() {
            expect(this.command._convertRomajiToKana("nihonjindesu")).to.equal("にほんじんです");
        });

        it("Converts long vowels to their appropriate double vowel representations", function() {
            expect(this.command._convertRomajiToKana("ohayō")).to.equal("おはよう");
        });

        it("Handles double consonants correctly", function() {
            expect(this.command._convertRomajiToKana("konnichiwa")).to.equal("こんにちは");
            expect(this.command._convertRomajiToKana("chotto")).to.equal("ちょっと");
        })

        it("Preserves spaces as full-width spaces", function() {
            expect(this.command._convertRomajiToKana("yoroshiku onegaishimasu")).to.equal("よろしく　おねがいします");
        });

        it("Preserves question marks as full-width question marks", function() {
            expect(this.command._convertRomajiToKana("dare desu ka?")).to.equal("だれ　です　か？");
        })

        it("Ignores capitalization", function() {
            expect(this.command._convertRomajiToKana("Yoroshiku")).to.equal("よろしく");
        });

        it("Strips apostrophes", function() {
            expect(this.command._convertRomajiToKana("kon'nichiwa")).to.equal("こんにちは");
        });

        it("Strips hyphens", function() {
            expect(this.command._convertRomajiToKana("ichi-ban")).to.equal("いちばん");
        });

        it("Processes complex kana before basic kana to avoid erroneous transliterations", function() {
            expect(this.command._convertRomajiToKana("tani")).to.equal("たに"); // not たんい
        });

        it("Processes particle は", function() {
            expect(this.command._convertRomajiToKana("watashi wa nihonjindesu")).to.equal("わたしは　にほんじんです");
        })

        it("Processes particle を", function() {
            expect(this.command._convertRomajiToKana("inu o kudasai")).to.equal("いぬを　ください");
        })

        it("Processes particle へ", function() {
            expect(this.command._convertRomajiToKana("nihon e unten shitai")).to.equal("にほんへ　うんてん　したい");
        });

        it("Correctly resolves こんにちは", function() {
            expect(this.command._convertRomajiToKana("kon'nichiwa")).to.equal("こんにちは");
        });

        it("Correctly resolves こんばんは", function() {
            expect(this.command._convertRomajiToKana("kon'banwa")).to.equal("こんばんは");
        });
    })
});