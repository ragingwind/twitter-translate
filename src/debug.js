/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

var logging = {
	NO: 999,
	DEBUG: 0,
	ERROR: 1,
	level: -1,
	debug: function(l) {
		if (logging.level <= logging.DEBUG)
			console.debug(l);
	},
	error: function(l) {
		if (logging.level <= logging.ERROR)
			console.error(l);
	},
};

var env = {
	language: function() {
		var n = navigator;
		if (n.language)
			return n.language;
		else if (n.browserLanguage)
			return n.browserLanguage;
		else if (n.systemLanguage)
			return n.systemLanguage;
		else if (n.userLanguage)
			return n.userLanguage;
		return null;
	},
}

var timer = {
	time: null,
	start: function() {
		time = new Date();
	},
	stop: function() {
		var now = new Date();
		var diff = now.getTime() - time.getTime();
		time = now;
		return diff;		
	}
}

String.prototype.ltrim = function() {
	var re = /\s*((\S+\s*)*)/;
	return this.replace(re, "$1");
}

String.prototype.rtrim = function() {
	var re = /((\s*\S+)*)\s*/;
	return this.replace(re, "$1");
}

String.prototype.trim = function() {
	return this.ltrim().rtrim();
}
