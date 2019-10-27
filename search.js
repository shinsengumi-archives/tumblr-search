alert("hello");

var keyword = "okita";
var tags = [];

$.getJSON('http://query.yahooapis.com/v1/public/yql?q=select%20%2a%20from%20yahoo.finance.quotes%20WHERE%20symbol%3D%27WRC%27&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback', function(data) {
    //data is the JSON string
});

//window.location.replace("http://www.w3schools.com");

