jQuery.ajaxSettings.traditional = true;  

//spotify API objects
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var player = models.player;

var lyrics;							//JSON data from tunewiki
var CurrentLyrics;					//object created for each song. contains lyric info and method to write to screen during updateFrame
var lyricsReady = false;			//

var xMax = window.innerWidth*.9;		//size of 
var yMax = window.innerHeight*.75;
var xOffSet = .08*xMax;				//space alone sides of xOffset not written over
var canvas = document.getElementById("canvas");
canvas.width = xMax;
canvas.height = yMax;
var CC = canvas.getContext("2d"); 

var MousePressed = false;

function init() {
	fetchLyrics(player.track.data);
	updateFrame();
}	

//quarys tunewiki
function fetchLyrics(track) {
	info('Getting lyrics for ' + track.title + ' by ' + track.artist);
	var url ='http://api.tunewiki.com/smp/v2/getLyric?device=900&spotifytok=3a09d705db235ba7b8b708876132ce3b';
    $.getJSON(url, {
        'json':'true',
        'artist':track.artists[0].name.decodeForText(),
        'album':track.album.name.decodeForText(),
		'title':track.name.decodeForText()}, 
        function (ldata) {
            info("Got the lyrics");
            lyrics = ldata;
    });
}


function updateFrame() {
	if (CurrentLyrics) {	
		if (CurrentLyrics.lyricsReady) {
			CurrentLyrics.displayLyrics();
		}
	}
	else {	
		if (lyrics) {
			savelyrics = lyrics;
			CurrentLyrics = new createSongLyrics(lyrics);
		}
		else {
			info("waiting on tunewiki");
		}
	}
	setTimeout("updateFrame()",5);
}


//event listener for keypress. sends them to CurrentLyrics if it exists
$(window).bind('keypress', function(e) {
	saveKey = e;
    var code = (e.keyCode ? e.keyCode : e.which);
	if(CurrentLyrics && CurrentLyrics.lyricsReady){
		CurrentLyrics.compareToNext(String.fromCharCode(e.charCode));
	}
});

//listener for track changes
player.observe(models.EVENT.CHANGE, function (event) {
	if (event.data.curtrack) {
		if (CurrentLyrics && CurrentLyrics.validScore) {
			var score = Math.round(CurrentLyrics.lineSpeed.sum());
			var scoreText;
			if (CurrentLyrics.highScore < score ) {
				scoreText = "High Score of " + score + " beacts the previous High Score  of " + 
					CurrentLyrics.highScore + " on " + CurrentLyrics.songName +"!";
				loalStorage.setItem(CurrentLyrics.songID, score);
			}
			else {
					scoreText = "Score of " + score + " fails to beat the current High Score of " + 
						CurrentLyrics.highScore + " on " + CurrentLyrics.songName +".";
			}				
			document.getElementById("highScore").innerHTML = scoreText.decodeForHTML();

		}		
		lyrics = null;
		CurrentLyrics = null;
		fetchLyrics(player.track.data);
}});


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

function info(s) {
	$("#info").text(s);
}

init();