const { spawn } = require('child_process');
var kanaMatcher = RegExp("^~(kana|rom)(?:\\s*(.+))?$");
var Command = function() {
    this.matches = function(message) {
        return kanaMatcher.test(message.content);
    }

    this.create = function(message) {
        return new MessageReplier(message);
    }

    this.notify = function() {}

    // Convenience function intended for unit testing only
    this._convertRomajiToKana = function(text) {
        return convertRomajiToHiragana(text);
    }
}

var MessageReplier = function(message) {
    this.message = message;

    var result = kanaMatcher.exec(message);
    this.type = result[1];
    this.sentence = result[2];
}

// Note that we go in a semi-reversed order so that we don't do replacements like a ->　あ before ka -> か which
// would otherwise incorrectly leave us with `kあ`
const KANA_TABLE = [
    // Double consonants first, because it's a two-step process to convert
    {ro: /kk/gi, hi: "っk", ka: "ッk"},
    {ro: /gg/gi, hi: "っg", ka: "ッg"},
    {ro: /ss/gi, hi: "っs", ka: "ッs"},
    {ro: /zz/gi, hi: "っz", ka: "ッz"},
    {ro: /jj/gi, hi: "っj", ka: "ッj"},
    {ro: /tt/gi, hi: "っt", ka: "ッt"},
    {ro: /cc/gi, hi: "っc", ka: "ッc"},
    {ro: /dd/gi, hi: "っd", ka: "ッd"},
    {ro: /nn/gi, hi: "んn", ka: "ンn"}, // Assume 'nn' comes from ん＋な・に・ぬ・ね・の
    {ro: /hh/gi, hi: "っh", ka: "ッh"},
    {ro: /ff/gi, hi: "っf", ka: "ッf"},
    {ro: /bb/gi, hi: "っb", ka: "ッb"},
    {ro: /pp/gi, hi: "っp", ka: "ッp"},
    {ro: /mm/gi, hi: "っm", ka: "ッm"},
    {ro: /rr/gi, hi: "っr", ka: "ッr"},

    // Voiced sounds next (longest characters)
    {ro: /kya/gi, hi: "きゃ", ka: "キャ"},
    {ro: /kyu/gi, hi: "きゅ", ka: "キュ"},
    {ro: /kyo/gi, hi: "きょ", ka: "キョ"},
    {ro: /gya/gi, hi: "ぎゃ", ka: "ギャ"},
    {ro: /gyu/gi, hi: "ぎゅ", ka: "ギュ"},
    {ro: /gyo/gi, hi: "ぎょ", ka: "ギョ"},
    {ro: /sha/gi, hi: "しゃ", ka: "シャ"},
    {ro: /shu/gi, hi: "しゅ", ka: "シュ"},
    {ro: /sho/gi, hi: "しょ", ka: "シャ"},
    {ro: /ja/gi, hi: "じゃ", ka: "ジャ"},
    {ro: /ju/gi, hi: "じゅ", ka: "ジュ"},
    {ro: /jo/gi, hi: "じょ", ka: "じょ"},
    {ro: /cha/gi, hi: "ちゃ", ka: "チャ"}, // voiced form of ちゃ　ちゅ　ちょ
    {ro: /chu/gi, hi: "ちゅ", ka: "チュ"}, // probably can't be distinguished easily.
    {ro: /cho/gi, hi: "ちょ", ka: "チョ"}, // for now they are ignored.
    {ro: /nya/gi, hi: "にゃ", ka: "ニャ"},
    {ro: /nyu/gi, hi: "にゅ", ka: "ニュ"},
    {ro: /nyo/gi, hi: "にょ", ka: "ニョ"},
    {ro: /hya/gi, hi: "ひゃ", ka: "ヒャ"},
    {ro: /hyu/gi, hi: "ひゅ", ka: "ヒュ"},
    {ro: /hyo/gi, hi: "ひょ", ka: "ヒョ"},
    {ro: /bya/gi, hi: "びゃ", ka: "ビャ"},
    {ro: /byu/gi, hi: "びゅ", ka: "ビュ"},
    {ro: /byo/gi, hi: "びょ", ka: "ビョ"},
    {ro: /pya/gi, hi: "ぴゃ", ka: "ピャ"},
    {ro: /pyu/gi, hi: "ぴゅ", ka: "ピュ"},
    {ro: /pyo/gi, hi: "ぴょ", ka: "ピョ"},
    {ro: /mya/gi, hi: "みゃ", ka: "ミャ"},
    {ro: /myu/gi, hi: "みゅ", ka: "ミュ"},
    {ro: /myo/gi, hi: "みょ", ka: "ミョ"},
    {ro: /rya/gi, hi: "りゃ", ka: "リャ"},
    {ro: /ryu/gi, hi: "りゅ", ka: "リュ"},
    {ro: /ryo/gi, hi: "りょ", ka: "リョ"},

    // 3-letter basic characters
    {ro: /shi/gi, hi: "し", ka: "シ"},
    {ro: /chi/gi, hi: "ち", ka: "チ"},
    {ro: /tsu/gi, hi: "つ", ka: "ツ"},
    {ro: /dzu/gi, hi: "づ", ka: "ヅ"}, // it is unlikely we will be able to detect this character

    // Basic characters
    {ro: /ka/gi, hi: "か", ka: "カ"},
    {ro: /ki/gi, hi: "き", ka: "キ"},
    {ro: /ku/gi, hi: "く", ka: "ク"},
    {ro: /ke/gi, hi: "け", ka: "ケ"},
    {ro: /ko/gi, hi: "こ", ka: "コ"},
    {ro: /ga/gi, hi: "が", ka: "ガ"},
    {ro: /gi/gi, hi: "ぎ", ka: "ギ"},
    {ro: /gu/gi, hi: "ぐ", ka: "グ"},
    {ro: /ge/gi, hi: "げ", ka: "ゲ"},
    {ro: /go/gi, hi: "ご", ka: "ゴ"},
    {ro: /sa/gi, hi: "さ", ka: "サ"},
    // shi was done above
    {ro: /si/gi, hi: "し", ka: "シ"}, // 'si' should not occur, but just in case
    {ro: /su/gi, hi: "す", ka: "ス"},
    {ro: /se/gi, hi: "せ", ka: "セ"},
    {ro: /so/gi, hi: "そ", ka: "ソ"},
    {ro: /za/gi, hi: "ざ", ka: "ザ"},
    {ro: /ji/gi, hi: "じ", ka: "ジ"},
    {ro: /zu/gi, hi: "ず", ka: "ズ"},
    {ro: /ze/gi, hi: "ぜ", ka: "ゼ"},
    {ro: /zo/gi, hi: "ぞ", ka: "ゾ"},
    {ro: /ta/gi, hi: "た", ka: "タ"},
    // tsu was done above
    {ro: /te/gi, hi: "て", ka: "テ"},
    {ro: /to/gi, hi: "と", ka: "ト"},
    {ro: /da/gi, hi: "だ", ka: "ダ"},
    {ro: /di/gi, hi: "ぢ", ka: "ヂ"}, // unlikely to show up in transliteration, but just in case
    {ro: /du/gi, hi: "づ", ka: "ヅ"}, // it is unlikely we will be able to detect this character
    {ro: /de/gi, hi: "で", ka: "デ"},
    {ro: /do/gi, hi: "ど", ka: "ド"},
    {ro: /na/gi, hi: "な", ka: "ナ"},
    {ro: /ni/gi, hi: "に", ka: "ニ"},
    {ro: /nu/gi, hi: "ぬ", ka: "ヌ"},
    {ro: /ne/gi, hi: "ね", ka: "ネ"},
    {ro: /no/gi, hi: "の", ka: "ノ"},
    {ro: /ha/gi, hi: "は", ka: "ハ"},
    {ro: /hi/gi, hi: "ひ", ka: "ヒ"},
    {ro: /fu/gi, hi: "ふ", ka: "フ"},
    {ro: /hu/gi, hi: "ふ", ka: "フ"}, // unlikely to show up in transliteration, but just in case
    {ro: /he/gi, hi: "へ", ka: "ヘ"},
    {ro: /ho/gi, hi: "ほ", ka: "ホ"},
    {ro: /ba/gi, hi: "ば", ka: "バ"},
    {ro: /bi/gi, hi: "び", ka: "ビ"},
    {ro: /bu/gi, hi: "ぶ", ka: "ブ"},
    {ro: /be/gi, hi: "べ", ka: "ベ"},
    {ro: /bo/gi, hi: "ぼ", ka: "ボ"},
    {ro: /pa/gi, hi: "ぱ", ka: "パ"},
    {ro: /pi/gi, hi: "ぴ", ka: "ピ"},
    {ro: /pu/gi, hi: "ぷ", ka: "プ"},
    {ro: /pe/gi, hi: "ぺ", ka: "ペ"},
    {ro: /po/gi, hi: "ぽ", ka: "ポ"},
    {ro: /ma/gi, hi: "ま", ka: "マ"},
    {ro: /mi/gi, hi: "み", ka: "ミ"},
    {ro: /mu/gi, hi: "む", ka: "ム"},
    {ro: /me/gi, hi: "め", ka: "メ"},
    {ro: /mo/gi, hi: "も", ka: "モ"},
    {ro: /ya/gi, hi: "や", ka: "ヤ"},
    {ro: /yu/gi, hi: "ゆ", ka: "ユ"},
    {ro: /yo/gi, hi: "よ", ka: "ヨ"},
    {ro: /ra/gi, hi: "ら", ka: "ラ"},
    {ro: /ri/gi, hi: "り", ka: "リ"},
    {ro: /ru/gi, hi: "る", ka: "ル"},
    {ro: /re/gi, hi: "れ", ka: "レ"},
    {ro: /ro/gi, hi: "ろ", ka: "ロ"},
    {ro: /wa/gi, hi: "わ", ka: "ワ"},
    {ro: /wo/gi, hi: "を", ka: "ヲ"},

    // Single romaji characters come last
    {ro: /a/gi, hi: "あ", ka: "ア"},
    {ro: /i/gi, hi: "い", ka: "イ"},
    {ro: /u/gi, hi: "う", ka: "ウ"},
    {ro: /e/gi, hi: "え", ka: "エ"},
    {ro: /o/gi, hi: "お", ka: "オ"},
    {ro: /n/gi, hi: "ん", ka: "ン"}
];


function convertRomajiToHiragana(romaji) {
    // This is not the kindest approach to the problem, but it's the most obvious approach and it's still O(n)
    // It could be cleaned up later, probably.

    // Convert long vowels. Do this first because it may impact a kana selection with a consonant.
    romaji = romaji.replace(/ā/gi, "aa");
    romaji = romaji.replace(/ī/gi, "ii");
    romaji = romaji.replace(/ū/gi, "uu");
    romaji = romaji.replace(/ē/gi, "ei");
    romaji = romaji.replace(/ō/gi, "ou");

    // Perform particle replacement early. This is our best chance to identify particles before they get
    // too blended to identify.
    romaji = romaji.replace(/ wa /gi, "は "); // bind particle to the preceding word, as per convention
    romaji = romaji.replace(/ o /gi, "を ");
    romaji = romaji.replace(/ e /gi, "へ ");
    
    // Some words get the particle attached. Handle these manually
    romaji = romaji.replace(/kon'?nichiwa/gi, "こんにちは");
    romaji = romaji.replace(/kon'?banwa/gi, "こんばんは");

    // Run through the kana table
    KANA_TABLE.forEach((transliteration) => {
        romaji = romaji.replace(transliteration.ro, transliteration.hi)
    });

    // Strip apostrophes. We do this after the kana table because it can help with the 'n' resolution.
    romaji = romaji.replace(/'/g, "");

    // Use full-width spaces
    romaji = romaji.replace(/ /g, "　");

    return romaji;
}

MessageReplier.prototype.execute = function() {
    var message = this.message; // needed because the below lambdas will destroy 'this'
    var convertToKana = (this.type == "kana");
    message.channel.startTyping();
    try 
    {
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
                message.channel.stopTyping();
            } else {
                result = result.trim();
                if (convertToKana) {
                    result = convertRomajiToHiragana(result);
                }
                message.reply(result);
                message.channel.stopTyping();
            }
        })
    } catch (ex) {
        console.error(`An error occurred during transliteration: ${ex}`)
        message.channel.stopTyping();
    }

}


module.exports = new Command();
