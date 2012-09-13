jQuery.ajaxSettings.traditional = true;  

//spotify API objects
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var player = models.player;

var rawLyrics;							//JSON data from tunewiki
var CurrentLyrics = null;			//object created for each song. contains lyric info and method to write to screen during updateFrame
var lyricsReady = false;			
var resetCurrentLyrics = false;

var xMax = window.innerWidth*.9;	//size of 
var yMax = window.innerHeight*.75;
var xOffSet = .08*xMax;				//space alone sides of xOffset not written over
var canvas = document.getElementById("canvas");
canvas.width = xMax;
canvas.height = yMax;
var CC = canvas.getContext("2d"); 
var textboxLR = "                                  " //textbox line return

var MousePressed = false;

function init() {
	fetchLyrics(player.track.data, true);
	updateFrame();
}	

//quarys tunewiki
function fetchLyrics(track, displayInfo) {
	try {
		var savedRawLyrics = JSON.parse(localStorage.getItem(player.track.uri + "rawLyrics"));
	}
	catch (e){}
	if (savedRawLyrics){
		rawLyrics = savedRawLyrics;
		console.log("loaded local lyrics");
		callFormatSongLyrics(savedRawLyrics);
	}
	else {
		player.playing = false;
		if (displayInfo){
			info('Getting lyrics for ' + track.name.decodeForText() + 
			' by ' + track.artists[0].name.decodeForText() + "...");
		}
		var url ='http://api.tunewiki.com/smp/v2/getLyric?device=900&spotifytok=3a09d705db235ba7b8b708876132ce3b';
	    $.getJSON(url, {
	        'json':'true',
	        'artist':track.artists[0].name.decodeForText(),
	        'album':track.album.name.decodeForText(),
			'title':track.name.decodeForText()}, 
			function(ldata){
				save2 = ldata;
				localStorage.setItem(player.track.uri + "rawLyrics",JSON.stringify(ldata));
				console.log("saved lyrics")
				callFormatSongLyrics (ldata);
			}
	        );
	}
}

function callFormatSongLyrics(ldata) {
	save = ldata;
	if (player.playing == false) {
       info(textboxLR + "Got Lyrics - Click to Play!");
	}
	else {
		info(textboxLR + "Type the Lyrics!");
	}	
	CurrentLyrics = new createSongLyrics(ldata);
}

function updateFrame() {
	webkitRequestAnimationFrame (updateFrame);
	if (resetCurrentLyrics){
		CurrentLyrics = null;
		resetCurrentLyrics = false;
		fetchLyrics(player.track.data, true);
	}

	if (CurrentLyrics) {	
		if (CurrentLyrics.lyricsReady) {
			CurrentLyrics.displayLyrics();
		}
		if (CurrentLyrics.songID != player.track.uri){
			trackChange();
		}
	}
}


//event listener for keypress. sends them to CurrentLyrics if it exists
$(window).bind('keypress', function(e) {
	saveKey = e;
    var code = (e.keyCode ? e.keyCode : e.which);
	if(CurrentLyrics && CurrentLyrics.lyricsReady){
		CurrentLyrics.compareToNext(String.fromCharCode(e.charCode));
	}
});

//called when track has changed
function trackChange() {
	console.log("track change");
	if (CurrentLyrics.lyricsReady && CurrentLyrics.validScore) {
		var score = Math.round(CurrentLyrics.lineSpeed.sum());
		var scoreText;
		if (CurrentLyrics.highScore < score ) {
			scoreText = "High Score of " + score + " beacts the previous High Score  of " + 
				CurrentLyrics.highScore + " on " + CurrentLyrics.songName +"!";
			localStorage.setItem(CurrentLyrics.songID + "hs", score);
		}
		else {
				scoreText = "Score of " + score + " fails to beat the current High Score of " + 
					CurrentLyrics.highScore + " on " + CurrentLyrics.songName +".";
		}				
		document.getElementById("highScore").innerHTML = scoreText.decodeForHTML();

	}		
	resetCurrentLyrics = true;
}

//called when the text box is clicked
function textboxClick() {
	if (CurrentLyrics){
		if (CurrentLyrics.lyricsReady){
			player.playing = true;
			info(textboxLR + "Type the Lyrics!");
		}
		else {
			player.next();		
		}
	}
}

function info(s) {
	document.getElementById("textbox").innerHTML = s;					
}

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};
Array.prototype.sum = function(){
	for(var i=0,sum=0;i<this.length;sum+=this[i++]);
	return sum;
}
Array.prototype.setAll = function(v) {
    var i, n = this.length;
    for (i = 0; i < n; ++i) {
        this[i] = v;
	}
};



init();