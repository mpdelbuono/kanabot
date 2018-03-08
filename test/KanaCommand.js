require('mocha')
var expect = require('chai').expect

var MockDiscordMessage = function(message) {
    this.content = message;
}

describe("KanaCommand", function() {
    beforeEach(function() {
        this.command = require("../commands/KanaCommand.js");
    })
    describe("#matches(message)", function() {
        it("matches all messages starting with ~kana", function() {
            expect(this.command.matches("~kana 日本語")).is.true
            expect(this.command.matches("~kana")).is.true;
            expect(this.command.matches("~kanano")).is.false
        });
        it("Matches messages containing Japanese characters");
        it("Does not fail if no previous message was received on a check-last message");
    });

    describe("#create(message)#execute()", function() {
        describe("if using ~kana with no arguments", function() {
            it("Does not fail if no previous Kanji message was received");
            it("Replies with an appropriate hiragana transliteration for the previous kanji message");
            it("Includes katakana where it was in the previous kanji message");
            it("Skips over non-kanji messages");
            it("Does not confuse messages in different channels");
        });

        describe("if using ~kana with an argument", function() {
            it("Replies with an error message if it does not appear to be Japanese");
            it("Replies with an appropriate hiragana transliteration");
            it("Includes katakana where it was in the original message");
        });
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

        it("Ignores capitalization", function() {
            expect(this.command._convertRomajiToKana("Yoroshiku")).to.equal("よろしく");
        });

        it("Strips apostrophes", function() {
            expect(this.command._convertRomajiToKana("kon'nichiwa")).to.equal("こんにちは");
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