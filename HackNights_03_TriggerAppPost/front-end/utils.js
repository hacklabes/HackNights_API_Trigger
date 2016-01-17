// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
	// Grab elements, create settings, etc.
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		video = document.getElementById("video"),
		videoObj = { "video": true },
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = stream;
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
		}, errBack);
	}
	else if(navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
		}, errBack);
	}
}, false);

function sendMultipart(mpdata){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", './post', true);
    xmlHttp.setRequestHeader("content-type", "multipart/form-data; charset=utf-8; boundary=0xbeef");
    var multipart = '--0xbeef\r\n';
    multipart += 'Content-Disposition: form-data; name="dataurl"\r\n\r\n';
    multipart += mpdata+'\r\n';
    multipart += '--0xbeef--';
    xmlHttp.send(multipart);
}
