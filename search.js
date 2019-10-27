const MAX_RESULTS = 50;

var iSearch = document.URL.indexOf("/search/");
if(iSearch >= 0){
	var keyword = document.URL.substring(iSearch+8);
	mySearch(keyword, ["-index"]);
}
    
var iTagged = document.URL.indexOf("/tagged/");
if(iTagged >= 0){
	var tags = document.URL.substring(iTagged+8, document.URL.lastIndexOf('/'));
	tagSearch(tags.replace('-',' ').split('+'));
}

function mySearch(keyword, tags){
	const data_file = 'https://cdn.jsdelivr.net/gh/shinsengumi-archives/tumblr-search/data.json';

	keyword = keyword.replace('+', ' ');
	keyword = decodeURIComponent(keyword.toLowerCase()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	keyword = keyword.replace(/[\u00A0-\u9999<>\&]/gi, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });

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
		
		var count = 0;
		for (i = 0; i < orderedKeys.length; i++) {
		    var key = orderedKeys[i].toString();
			matched[key].forEach(function(post_html) {
				var post = document.createElement('div');
				post.innerHTML = post_html;
				var countDisplay = document.createElement('div');
				countDisplay.style.cssText = "text-align: right; margin-right: 20px"; 
				countDisplay.innerHTML = "<p>"+key+" matches</p>";
				post.appendChild(countDisplay);
				container.appendChild(post);
			});
			count += matched[key].length;
			if (count > MAX_RESULTS) {
			    break;
			}
		}
		
		
	});
}

function matchTags(tags, must_contain, not_contain, post_tags) {
	for (itag = 0; itag < must_contain.length; itag++) {
		if (!post_tags.includes(must_contain[itag])) {
			return false;
		}
	}
	
	for (itag = 0; itag < not_contain.length; itag++) {
		if (post_tags.includes(not_contain[itag])) {
			return false;
		}
	}
	
	for (itag = 0; itag < tags.length; itag++) {
		if (post_tags.includes(tags[itag])) {
			return true;
		}
	}

	return tags.length == 0;
}

function tagSearch(tags){
    var container = document.getElementById("content");
    var notFoundPost = container.innerHTML;
    container.innerHTML = "";

	const data_file = 'https://cdn.jsdelivr.net/gh/shinsengumi-archives/tumblr-search/data.json';

	$.getJSON(data_file, function(data) {
		
		
		var notTags = tags.filter(function(tag){
			return tag.charAt(0) == '!';
		}).map(function(tag){
    		return tag.substring(1);
    	});
		tags = tags.filter(function(tag){
			return tag.charAt(0) != '!';
		});
		if (notTags.length==0 && tags.length==1) {
		    return;
		}
		
		var posts = [];
		for (var id in data.posts) {
			post_data = data.posts[id];
			if (!matchTags([], tags, notTags, post_data.tags)) {
				continue;
			}
			posts.push(post_data.html);
			if (posts.length > MAX_RESULTS) {
			    break;
			}
		}

		if (posts.length == 0) {
		    container.innerHTML = notFoundPost;
		}
		posts.forEach(function(post_html) {
	        var post = document.createElement('div');
			post.innerHTML = post_html;
			container.appendChild(post);
		});
		
	});
}
