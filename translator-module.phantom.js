#!/usr/bin/env phantomjs

var system = require('system');
var text = system.stdin.read();
var sourceLang="ja";
var targetLang="ja";
var url = "https://translate.google.com/#"+sourceLang+"/"+targetLang;

var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:13.0) Gecko/20100101 Firefox/13.0';

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    // uncomment to log into the console 
    // console.error(msgStack.join('\n'));
};

page.onConsoleMessage = function (msg) {
        if ( msg == "phanthom.exit()" ) {
                phantom.exit();
        } else {
          system.stdout.write(msg);
          system.stdout.flush();
        }
        page.render("test.png");
};

/*
 * This function wraps WebPage.evaluate, and offers the possibility to pass
 * parameters into the webpage function. The PhantomJS issue is here:
 * 
 *   http://code.google.com/p/phantomjs/issues/detail?id=132
 * 
 * This is from comment #43.
 */
function evaluate(page, func) {
    var args = [].slice.call(arguments, 2);
    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
    return page.evaluate(fn);
}

page.open(url, function (status) {
        if (status !== 'success') {
                console.log('Unable to access network');
        } else {
                var result = evaluate(page, function(text){
                        var getResult=function(){
                                var result_box=document.querySelector("#src-translit");
                                var input_box=document.querySelector("#source");
                                if ( input_box == null )
                                        setTimeout( getResult, 1000 );
                                else {
                                        input_box.value=text;
                                        if ( result_box == null || result_box.innerText == "" ) {
                                                setTimeout( getResult, 1000 );
                                        } else {
                                                console.log(result_box.innerText);
                                                console.log("phanthom.exit()")
                                        }
                                }
                        }
                        getResult();
                }, text );
        }
});
