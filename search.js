function mySearch(keyword, tags, chrono){
    var keywordSearch = keyword !== "";
    
	var tags_must_contain = tags.filter(function(tag){
		return tag.charAt(0) == '*';
	}).map(function(tag){
		return tag.substring(1);
	});
	var tags_not_contain = tags.filter(function(tag){
		return tag.charAt(0) == '!';
	}).map(function(tag){
		return tag.substring(1);
	});
	tags = tags.filter(function(tag){
		return tag.charAt(0) != '*' && tag.charAt(0) != '!';
	})
	
	if (!keywordSearch && tags_must_contain.length==0 && tags_not_contain.length==0 && tags.length==1) {
	    return;
	}
	
	var container = document.getElementById("content");
    var original = container.innerHTML;
    container.innerHTML = "";
    
    keyword = keyword.replace('+', ' ');
	keyword = decodeURIComponent(keyword.toLowerCase()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	keyword = keyword.replace(/[\u00A0-\u9999<>\&]/gi, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });
	
	$.getJSON(data_file, function(data) {
		var matched = {};
		var ids = Object.keys(data.posts);
		if (tags.length > 0) {
		    ids = Object.keys(data.tags).filter(function(tag) {
		        return tags.includes(tag);
		    }).map(function(tag) {
		        return data.tags[tag];
		    });
		    ids = [].concat.apply([], ids);
		}
		
		for (var iId in ids) {
		    var id = ids[iId];
			var post_data = data.posts[id];
			
			if (!matchTags(tags, tags_must_contain, tags_not_contain, post_data.tags)) {
				continue;
			}
			
			if (keywordSearch) {
			    var post_text = post_data.text.toLowerCase();
    			var regex = new RegExp(keyword, "g");
    			var score = (post_text.match(regex) || []).length;
    			if (score > 0) {
    				if (!(score in matched)) {
    					matched[score] = [];
    				}
    				matched[score].push(post_data.html);
    			}
			} else {
			    var ts = post_data.date;
    			if (!ts) {
    			    continue;
    			}
    			matched[ts] = [post_data.html];
			}
		}
		
		
		var count = 0;
		var orderedKeys = Object.keys(matched).map(function(i){
			return parseInt(i, 10);
		}).sort((a,b) => b - a);
		if (chrono) {
		    orderedKeys = orderedKeys.reverse();
		}
	
	    if (orderedKeys.length == 0) {
	        container.innerHTML = original;
	    }
		for (i = 0; i < orderedKeys.length; i++) {
		    var key = orderedKeys[i].toString();
			matched[key].forEach(function(post_html) {
				var post = document.createElement('div');
				post.innerHTML = post_html;
				
				if (keywordSearch) {
    				var countDisplay = document.createElement('div');
    				countDisplay.style.cssText = "text-align: right; margin-right: 20px"; 
    				countDisplay.innerHTML = "<p>"+key+" matches</p>";
    				post.appendChild(countDisplay);
				}
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