/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

var twitter = {	
	popup: {
		parent: window.document,
		bannerHTML: "<div id='tw-popup-banner' style='left:0;top:41px;height:41px;width:100%;z-index:2;position:absolute;text-align:center'></div>",
		error: function(m) {
			$(twitter.popup.parent).prepend(twitter.popup.bannerHTML);
			$("#tw-popup-banner").html("<div id='tw-popup'><div id='tw-popup-message'><span id='tw-popup-message-inner'>" + m + "</span></div>");
			$("#tw-popup-banner").show(5000, function() {
				$("#tw-popup-banner").fadeOut(2000);
			});
		}
	},
	translate: {
		option: {
			html: "<div id='tw-tr-option-banner' style='left:0;top:0;height:50px;width:100%;z-index:10000001;position:fixed;visibility:visible'><div id='tw-tr-option'><div id='tw-tr-option-bg'></div><div id='tw-tr-option-top-bar'><div id='tw-tr-option-inside'><div width='1' nowrap=''><img id='tw-tr-option-logo' src=''></div><div width='1' nowrap=''></div><div id='tw-tr-option-title' nowrap=''>Tweet translate into</div><div id='tw-tr-option-lang-list'><select id='tw-tr-option-lang-select' title='Select language for translation'><option value='ko'>Korean</option><option value='af'>Afrikaans</option><option value='sq'>Albanian</option><option value='ar'>Arabic</option><option value='be'>Belarusian</option><option value='bg'>Bulgarian</option><option value='ca'>Catalan</option><option value='zh-CN'>Chinese-Simp</option><option value='zh-TW'>Chinese-Trad</option><option value='hr'>Croatian</option><option value='cs'>Czech</option><option value='da'>Danish</option><option value='nl'>Dutch</option><option value='en'>English</option><option value='et'>Estonian</option><option value='tl'>Filipino</option><option value='fi'>Finnish</option><option value='fr'>French</option><option value='gl'>Galician</option><option value='de'>German</option><option value='el'>Greek</option><option value='iw'>Hebrew</option><option value='hi'>Hindi</option><option value='hu'>Hungarian</option><option value='is'>Icelandic</option><option value='id'>Indonesian</option><option value='ga'>Irish</option><option value='it'>Italian</option><option value='ja'>Japanese</option><option value='lv'>Latvian</option><option value='lt'>Lithuanian</option><option value='mk'>Macedonian</option><option value='ms'>Malay</option><option value='mt'>Maltese</option><option value='no'>Norwegian</option><option value='fa'>Persian</option><option value='pl'>Polish</option><option value='pt'>Portuguese</option><option value='ro'>Romanian</option><option value='ru'>Russian</option><option value='sr'>Serbian</option><option value='sk'>Slovak</option><option value='sl'>Slovenian</option><option value='es'>Spanish</option><option value='sw'>Swahili</option><option value='sv'>Swedish</option><option value='th'>Thai</option><option value='tr'>Turkish</option><option value='uk'>Ukrainian</option><option value='vi'>Vietnamese</option><option value='cy'>Welsh</option><option value='yi'>Yiddish</option></select></div><div width='1' nowrap=''><div id='tw-tr-option-close-button-box'><a id='tw-tr-option-close-button' href='javascript:void(0)' title='Close'><img id='tw-tr-option-close-button-img' src=''></a></div></div></div></div></div></div>",
			empty: function() {
				var lang = localStorage["lang"];
				if (!lang || lang.length == 0)
					return true;
				else
					return false;				
			},
			lang: function() {
				return localStorage["lang"];
			},
			loadOptions: function() {
				if (twitter.translate.option.empty()) {
					localStorage["lang"] = "en";
				}
				$("#tw-tr-option-lang-list option[value=" + localStorage["lang"] + "]").attr('selected', 'selected');
				$("#tw-tr-option-lang-list").change(function() {
					localStorage["lang"] = $("#tw-tr-option-lang-list option:selected").val();
				});
			},
			show: function(t) {
				var banner = $(t).find("#tw-tr-option-banner");
				if ($(banner).is(":visible") == false) {
					$(t).prepend("<div id='tw-tr-option-banner' style='left:0;top:0;height:50px;width:100%;z-index:10000001;position:fixed;visibility:visible'></div>");
					$("#tw-tr-option-banner").html(twitter.translate.option.html);
					$("#tw-tr-option-logo").attr("src", chrome.extension.getURL("/image/option.logo.png"));
					$("#tw-tr-option-close-button-img").attr("src", chrome.extension.getURL("/image/option.closebutton.gif"));
					$("#tw-tr-option-close-button").click(function() {
						$("#tw-tr-option-banner").hide();
					});
					$("#tw-tr-option-banner").dblclick(function() {
						$("#tw-tr-option-banner").hide();
					});
				}
				else
					$(banner).hide();
				twitter.translate.option.loadOptions();
			}
		},
		formatstr: function(k) {
			return "__" + k + "__";
		},
		formatstrWithRegex: function(t, dic, type, regex) {
			var count = dic.length;
			while (matched = t.match(regex)) {
				t = t.replace(matched[0].trim(), twitter.translate.formatstr(count));
				dic[count++] = {type:type, value:matched[0].trim()};
			}
			return t;
		},
		formatstrWithTweet: function(t, dic) {
			var count = 0;
			var matched = "";
			// mention with link
			t = twitter.translate.formatstrWithRegex(t, dic,"mention", /@[\w]+/);
			// hashtag
			t = twitter.translate.formatstrWithRegex(t, dic, "hashtag",/#[\w]+/);
			// normal link, com. net, org 
			t = twitter.translate.formatstrWithRegex(t, dic, "link", /(http(|s):)([\/][\/])([\w]|[\/.]|[~]|[?]|[=]|[#]|[!])*/);
			t = twitter.translate.formatstrWithRegex(t, dic, "link", /([\w]|[\/.]|[~])*(\.)(com|net|org|co.kr|or.kr|kr|co.jp)([\w]|[\/]|[~]|[?]|[=]|[#]|[!])*/);

			return t;
		},
		tweetWithFormatstr: function(t, dic) {
			for (key in dic) {
				var v = dic[key];
				if (v.type == "mention") {
					var id = v.value.substring(1, v.value.length);
					t = t.replace(RegExp(twitter.translate.formatstr(key), "g"), 
						"@<a class='twitter-atreply' data-screen-name='" + id 
						+ "' href='http://twitter.com/" + id + "' rel='nofollow'>" 
						+ id + "</a>");
				}
				else if (v.type == "hashtag") {
					var tag = v.value.substring(1, v.value.length);
					t = t.replace(RegExp(twitter.translate.formatstr(key), "g"), 
						"<a href='/#!/search?q=%23" + tag + "' title='" + tag +"' class='twitter-hashtag' rel='nofollow'>"
						+ "#" + tag + "</a>");
				}
				else if (v.type == "link") {
					var href = v.value;
					t = t.replace(RegExp(twitter.translate.formatstr(key), "g"), 
						"<a href='" + href + "' target='_blank' rel='nofollow' class='twitter-timeline-link'"
						+  "data-expanded-url='" + href + "' title='" + href + "'>" + href + "</a>");
				}
			}
			return t;
		}
	}
};