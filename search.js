alert("hello");

var keyword = "okita";
var tags = [];


window.onload = function () {
    var iSearch = document.URL.indexOf("/search/");
    if(iSearch >= 0){
    	var keyword = document.URL.substring(iSearch+8);
    	mySearch(keyword, []);
    }
}

function mySearch(keyword, tags){
	const data_file = 'https://raw.githubusercontent.com/shinsengumi-archives/tumblr-search/master/data.json';
	console.log(keyword);
	$.getJSON(data_file, function(data) {
		console.log(data);
		var container = document.getElementById("content");
		console.log(container)

		for (var id in data.posts) {
			post_data = data.posts[id];
			if (post_data.text.indexOf(keyword) >= 0) {
				var post = document.createElement('div');
				post.innerHTML= post_data.html;
				container.appendChild(post);
			}
		}
		
		
		console.log("qwe");
		console.log(container)
	});
}



//window.location.replace("http://www.w3schools.com");

