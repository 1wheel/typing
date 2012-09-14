jQuery.ajaxSettings.traditional = true;  

//spotify API objects
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var player = models.player;

//u
var CurrentLyrics = null;		//contains currently playing lyrics and methods
var resetCurrentLyrics = false;	//set to true when the track changes. on 

//UI objects
var xMax;					//size of 
var yMax;
var xOffSet;						//space alone sides of xOffset not written over
var canvas = document.getElementById("canvas");
var CC = canvas.getContext("2d"); 
var textboxLR = "                                    " //textbox line return
var MousePressed = false;

//called on page load
function init() {
	sizeCanvas();

	//looks up lyrics , allowing updates to the text box and not forcing
	fetchLyrics(player.track.data, true, false);
	updateFrame();
}	

//creates max sized canvas without scroll bars
function sizeCanvas(){
	canvas.width = 0;
	canvas.height = 0;

	xMax = window.innerWidth - 20;					//size of 
	yMax = window.innerHeight - 20
		- document.getElementById("upperCenter").offsetHeight
		- document.getElementById("lowerCenter").offsetHeight;	
	xOffSet = .08*xMax;								//space alone sides of xOffset not written over
	canvas = document.getElementById("canvas");
	canvas.width = xMax;
	canvas.height = yMax;
	CC = canvas.getContext("2d");
	CC.font = "30pt Calibri";

	if (CurrentLyrics && CurrentLyrics.lyricsReady) {
		CurrentLyrics.findLineBreak(CurrentLyrics.lyricLines[CurrentLyrics.CL]);
	}
}

//querys tunewiki
function fetchLyrics(track, displayInfo, forceQuery) {
	console.log("at start of fetchLyrics player is playing: " + player.playing)
	try {
		var savedRawLyrics = JSON.parse(localStorage.getItem(player.track.uri + "rawLyrics"));
	}
	catch (e){
		console.log("saved lyrics not an object");

	}
	if (savedRawLyrics && !forceQuery){
		console.log("loaded local lyrics");
		callFormatSongLyrics(savedRawLyrics, true);
	}

	else {
		player.playing = false;
		calledURI = player.track.uri;

		console.log("querying tunewiki");
		if (displayInfo){
			info('Getting lyrics for ' + track.name.decodeForText() + 
			' by ' + track.artists[0].name.decodeForText() + "...");
		}

		var url ='http://api.tunewiki.com/smp/v2/getLyric?device=900&spotifytok=64b27cdbdd824ce7d3c09782e9467176';
	    $.getJSON(url, {
	        'json':'true',
	        'artist':track.artists[0].name.decodeForText(),
	        'album':track.album.name.decodeForText(),
			'title':track.name.decodeForText()}, 
			function(ldata){
				//checks to make sure currently playing song matches called song
				if (calledURI == player.track.uri){	
					console.log("no track change during query");
					callFormatSongLyrics (ldata, false);
				}
				
				//if not, changes CurrentLyrics.songID to the old ID so song change logic will be triggered again
				else {
					console.log("track change during query - starting over");
					CurrentLyrics = {songID: player.track.calledURI}
					alert(calledURI + " " + player.track.uri );
				}
			}
	        );
	}
}

function callFormatSongLyrics(ldata, localLyrics) {
	save = ldata;
	if (player.playing == false) {
       info(textboxLR + "Got Lyrics - Click to Play!");
	}
	else {
		info(textboxLR + "Type the Lyrics!");
	}	
	CurrentLyrics = new createSongLyrics(ldata);

	//saved local lyrics aren't valid; try again, requiring tunewiki query
	if (!CurrentLyrics.lyricsReady && localLyrics) {
		fetchLyrics(player.track.data, true, true);
	}

	//remote lyrics are valid; save them locally
	if (CurrentLyrics.lyricsReady && !localLyrics) {
		localStorage.setItem(player.track.uri + "rawLyrics",JSON.stringify(ldata));
		console.log("saved lyrics")
	}
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
	console.log("track change noticed - reseting CurrentLyrics");
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
					CurrentLyrics.highScoreAl + " on " + CurrentLyrics.songName +".";
		}				
		document.getElementById("highScoreAlert").innerHTML = scoreText.decodeForHTML();

	}		
	resetCurrentLyrics = true;
}

//called when the text box is clicked
function textboxClick() {
	if (CurrentLyrics){
		if (CurrentLyrics.lyricsReady){
			player.playing = true;
			info(textboxLR + "Type the Lyrics!");
			console.log("textbox clicked");
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