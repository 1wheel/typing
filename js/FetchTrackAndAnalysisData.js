function fetchSongInfo(track) {
    info('Getting song info for ' + track.name + ' by '  + track.artists[0].name);
    var url = 'http://developer.echonest.com/api/v4/track/profile?api_key=N6E4NIOVYMTHNDM8J&callback=?';
    var track_id = fromSpotify(track.uri);

    $.getJSON(url, { id: track_id, format:'jsonp', bucket : 'audio_summary'}, function(data) {
        if (checkResponse(data)) {
            info("");
            //showTrackInfo(data.response.track);
            fetchAnalysis(data.response.track);
        } else {
            info("trouble getting results");
        }
    });
}

function fetchAnalysis(track) {
    info('Getting analysis info for ' + track.title + ' by '  + track.artist);
    var url = 'http://labs.echonest.com/3dServer/analysis?callback=?';

    cur_analysis = null;
    $.getJSON(url, { url: track.audio_summary.analysis_url}, function(data) {
        if ('meta' in data) {
            info("Got the analysis");
            cur_analysis = data;
			fetchLyrics(track);
        } else {
            info("trouble getting analysis");
        }
    });
}

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

function fromSpotify(spotifyID) {
	spotifyID = spotifyID.substr(14);
	spotifyID = "spotify-WW:track:"+spotifyID;
	info(spotifyID);
	return spotifyID;
}
	