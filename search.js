alert("hello");

var keyword = "okita";
var tags = [];

const data_file = 'https://raw.githubusercontent.com/shinsengumi-archives/tumblr-search/master/data.json';

$.getJSON(data_file, function(data) {
	console.log(data);
});

//window.location.replace("http://www.w3schools.com");

