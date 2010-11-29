/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

var cs = {
	tweet: null,
	formatstrDic: null,
	translateTimer: null,
	optionKeyPressed: 0,
	queryTime: null,
	clear: function() {
		if (cs.translateTimer) {
			clearTimeout(cs.translateTimer);
			cs.translateTimer = null;
		}
		cs.formatstrDic = [];		
	},
	onResponse: function(response) {
		if (response.id == "translation") {
			if (response.tweet) {
				var t = twitter.translate.tweetWithFormatstr(response.tweet, cs.formatstrDic);
				cs.tweet.html(t);
				twitter.popup.error("Tweet is translated. (" + timer.stop() / 1000 + ")");
			}
			else {
				twitter.popup.error("Translation is failed. Google translate API response with error 400. Please try again in a few second.");
				$(cs.tweet).closest(".tweet").find(".tweet-content-original").html("");
			}
		}
		
		cs.clear();
	},
	onTranslateTimeout: function() {
		twitter.popup.error("Translation is failed. Google doesn't response our request.");
		cs.clear();
	},	
	showOption: function() {
		twitter.translate.option.show("#doc");
	},
	addTranslateButton: function(t) {
		t.each(function() {
			var tweet_action = $(this).find(".tweet-actions");
			if (tweet_action && tweet_action.find(".translate-tweet").length == 0) {
				tweet_action.append("<a href='#' class='translate-tweet'><span><i></i><b>Translate</b></span></a>");
				tweet_action.append("<div class='tweet-content-original' style='visibility:hidden;display:none'></div>");
				tweet_action.find(".translate-tweet").click(function() {
					if (cs.optionKeyPressed) {
						cs.showOption();
						return;
					}
					
					var original = $(this).parent().find(".tweet-content-original");
					if (original.html().length == 0) {
						// DON'T ALLOW MULTIPLE REQUEST.
						if (cs.requestTimer) {
							twitter.popup.error("Request is not completed yet.");
							return;
						}
						cs.tweet = $(this).closest('.tweet').find('.tweet-text');
						var text = $(cs.tweet).text();
						original.html($(cs.tweet).html());

						// @TODO check the option
						text = twitter.translate.formatstrWithTweet(text, cs.formatstrDic);
						chrome.extension.sendRequest({id:"translation", tweet:text, targetlang:twitter.translate.option.lang()}, cs.onResponse);
						cs.translateTimer = window.setTimeout(cs.onTranslateTimeout, 8000);
						
						timer.start();
					}
					else {
						// UNDO translation
						twitter.popup.error("Undo translated tweet.");
						
						$(this).closest('.tweet').find('.tweet-text').html(original.html());
						original.html("");
					}
				});
			}
		});
	},
	setUp:function() {
		cs.clear();
		// add modifier key event listner
		$(window).keydown(function(e) {
			logging.debug("option key is pressed");
			cs.optionKeyPressed = e.altKey;
		});
		
		$(window).keyup(function(e) {
			logging.debug("option key is depressed");			
			cs.optionKeyPressed = false;
		});
		
		// This detecting technic from Retweet Old School http://j.mp/i4Nh47
		$('.tweet').live('mouseover',function(){
			cs.addTranslateButton($(this));
		});
		$('.tweet').live('click',function(){
			cs.addTranslateButton($(this));
		});

		logging.debug("setup is completed. ext is " + chrome.extension.getURL(""));
	},
};

$(document).ready(function() {
	logging.level = logging.NO;
	cs.setUp();
	twitter.popup.parent = "#top-bar-outer";

	if (twitter.translate.option.empty()) {
		twitter.popup.error("Please select language to translate.");
		cs.showOption();
	}
});
