var filesUpload = null;
var file = null;
var socket = io.connect('http://localhost:4320');
var send = false;

if (window.File && window.FileReader && window.FileList) {
    init();
} else {}

function init() {
    filesUpload = document.getElementById('imagefile');
    filesUpload.addEventListener('change', fileHandler, false);
}

function fileHandler(e) {
    var files = e.target.files || e.dataTransfer.files;
    if (files) {
        file = files[0];
    }
}

$("#imagefile").on('change',function(){
sendFile();
});

function sendFile() {
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            console.log('Sending file...');
            var buffer = e.target.result;
            var base64 = 
            socket.emit('send-file', file.name, buffer, myID);
            $("#imgLoading").html("uploading...");
        };
        reader.readAsBinaryString(file);
    }
}


$('#imagefile').bind('change', function(e){
    var data = e.originalEvent.target.files[0];
    readThenSendFile(data);      
});

function readThenSendFile(data){
    var reader = new FileReader();
    reader.onload = function(evt){
        base64 = evt.target.result;
        socket.emit('preview-file', base64, myID);
    };
    reader.readAsDataURL(data);
}