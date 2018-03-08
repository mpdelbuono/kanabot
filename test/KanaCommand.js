require('mocha')
var expect = require('chai').expect

describe("KanaCommand", function() {
    describe("#matches(message)", function() {
        it("matches all messages starting with ~kana");
        it("Matches messages containing Japanese characters");
        it("Does not fail if no previous message was received on a check-last message");
    });

    describe("#create(message)", function() {
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
});