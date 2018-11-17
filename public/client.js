var socket = io.connect("http://localhost:4320");
var myID = 0;
var hisID = 0;

socket.on("connect", function(data) {
  socket.emit("join", "Hello server from client");
});


// listener for 'thread' event, which updates messages
socket.on("thread", function(data) {
  $("#typing").html("");
  if(data.user_to == myID && data.user_id == hisID) {
  	if(data.image) {
  	  $("#thread").append("<li><b>" +data.username+ "</b> :  <img src='" +data.base64+"' style='max-width:200px;max-height:200px'/><br/>" + data.message + "</li>");
  	} else {
	    $("#thread").append("<li><b>" +data.username+ "</b> : " + data.message + "</li>"); }
  } else if (data.user_id == myID && data.user_to == hisID) {
  	if(data.image) {
  	   	 $("#thread").append("<li><b>" +data.username+ "</b> :  <img src='"+data.base64+"' style='max-width:200px;max-height:200px'/><br/>" + data.message + "</li>");
  	} else {
	    $("#thread").append("<li><b>" +data.username+ "</b> : " + data.message + "</li>"); }
  }
});


//listener for 'typing...' event
socket.on("typing", function(data) {
   	if(data.user_to == myID && data.user_id == hisID) {
		if(data.status === true) {
	       $("#typing").html("<li>his typing...</li>");
	     } else {
	       $("#typing").html("");
	     }
    }
});

// pass file info to form
socket.on("send_file", function(name,buffer,userid) {
  if(userid == myID) {
      $("#imgName").val(name);
      $("#imgBuffer").val(buffer);
      setTimeout(function() {
        $("#imgLoading").html(" ");
      }, 3000);
   }
});

// pass base64 file to form
socket.on("preview_file", function(base64,userid) {
    if(userid == myID) {
      $("#imgPreview").val(base64);
    }
});



// sends message to server, resets & prevents default form action
$("#send").click(function() {
    var user_id = $("#user_id").val();
    var username = $("#username").val();
    var user_to = $("#user_to").val();
    var message = $("#message").val();
    var image = $("#imgName").val();
    var base64 = $("#imgPreview").val();
    
    var msgDetails={  
      user_id : user_id,
      username : username,
      user_to : user_to,
      message : message,
      image : image,
      base64 : base64
    };  

   socket.emit("messages", msgDetails);
  console.log(msgDetails);
  $("#message").val(" ");
  $("#imgPreview").val(" ");
  $("#imgName").val(" ");
  $("#imgBuffer").val(" ");
  return false;
});


// timeout for typing... at least 2 sec

var timeout;
    function timeoutFunction() {  
        var typo ={
        	user_to : hisID,
        	user_id : myID,
        	status: false
        }
        socket.emit("is_typing", typo);
    }

$("#message").keypress(function (e) {
    if (e.which !== 13) {
        var typo ={
        	user_to : hisID,
        	user_id : myID,
        	status: true
        }
        socket.emit("is_typing", typo);
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    } else {
        clearTimeout(timeout);
        timeoutFunction();
    }
});

// Saved Info about who login and tolking to who
$("#saveID").click(function(){
 var val = $("#user_id").val();
 var his = $("#user_to").val();
 myID = val;
 hisID = his;
});


