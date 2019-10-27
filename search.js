
/*
window.onload = function () {
    var iSearch = document.URL.indexOf("/search/");
    if(iSearch >= 0){
    	var keyword = document.URL.substring(iSearch+8);
    	mySearch(keyword, ["-index"]);
    }
}*/

console.log("\u00e6\u00b2\u0096\u00e7\u0094\u00b0\u00e6\u009e\u0097\u00e5\u00a4\u00aa\u00e9\u0083\u008e");
console.log("\u00e6\u00b2\u0096\u00e7\u0094\u00b0\u00e7\u00b7\u008f\u00e5\u008f\u00b8");

function mySearch(keyword, tags){
	const data_file = 'https://raw.githubusercontent.com/shinsengumi-archives/tumblr-search/master/data.json';

	keyword = keyword.toLowerCase();
	var tags_must_contain = tags.filter(function(tag){
		return tag.charAt(0) == '+';
	}).map(function(tag){
		return tag.substring(1);
	});
	var tags_not_contain = tags.filter(function(tag){
		return tag.charAt(0) == '-';
	}).map(function(tag){
		return tag.substring(1);
	});
	tags = tags.filter(function(tag){
		return tag.charAt(0) != '+' && tag.charAt(0) != '-';
	})
	
	$.getJSON(data_file, function(data) {
		var container = document.getElementById("content");

		var matched = {};
		for (var id in data.posts) {
			post_data = data.posts[id];
			post_text = post_data.text.toLowerCase();
			if (!matchTags(tags, tags_must_contain, tags_not_contain, post_data.tags)) {
				continue;
			}
			var regex = new RegExp(keyword, "g");
			var score = (post_text.match(regex) || []).length;
			if (score > 0) {
				if (!(score in matched)) {
					matched[score] = [];
				}
				matched[score].push(post_data.html);
			}
		}
		
		var orderedKeys = Object.keys(matched).map(function(i){
			return parseInt(i, 10);
		}).sort((a,b) => b - a).slice(0,100);
		
		orderedKeys.forEach(function(key) {
			matched[key.toString()].forEach(function(post_html) {
				var post = document.createElement('div');
				post.innerHTML = post_html;
				container.appendChild(post);
			});
		});
		
		
	});
}

function matchTags(tags, must_contain, not_contain, post_tags) {
	for (i = 0; i < must_contain.length; i++) {
		if (!post_tags.includes(must_contain[i])) {
			return false;
		}
	}
	
	for (i = 0; i < not_contain.length; i++) {
		if (post_tags.includes(not_contain[i])) {
			return false;
		}
	}
	
	for (i = 0; i < tags.length; i++) {
		if (post_tags.includes(tags[i])) {
			return true;
		}
	}

	return tags.length == 0;
}
