var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

//MySQL npm install socket.io mysql
var mysql = require('mysql');
var db = mysql.createConnection({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'chat2',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    debug:   false
})

// Log any errors connected to the db
db.connect(function(err){
    if (err) console.log("db err :"+err);
    else console.log('db connected');
})

// Create Route
app.get("/", function(req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
});
app.use(express.static("public"));

// On Connection
io.on("connection", function(client) {
  console.log("Client connected...");

   // Upload File to uploads director
    client.on('send-file', function(name, buffer, userid) {
      var fs = require('fs');
      var timestamp = new Date().getTime();
      var imgName = timestamp+"-"+name
        var fileName = __dirname + '/uploads/' + imgName;
        fs.open(fileName, 'a', 0755, function(err, fd) {
            if (err) throw err;
            fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
                fs.close(fd, function() {
                    console.log('File saved successful!');
                    client.emit("send_file", imgName,buffer, userid);
                    client.broadcast.emit("send_file", imgName,buffer, userid);
                });
            })
        });
    });

    // preview File using base64
    client.on('preview-file', function(base64,userid) {
        client.emit("preview_file", base64,userid);
        client.broadcast.emit("preview_file", base64,userid);
    });

  
  // On Message broadCast it & Saved in DB
  client.on("messages", function(data) {
    client.emit("thread", data);
    client.broadcast.emit("thread", data);
    db.query("INSERT INTO `messages` (`user_from`,`user_to`,`message`,`image`,`base64`) VALUES ('"+data.user_id+"','"+data.user_to+"','"+data.message+"','"+data.image+"','"+data.base64+"')");
  });

  // On Typing... 
  client.on('is_typing', function(data) {
    if(data.status === true) {
       client.emit("typing", data);
       client.broadcast.emit('typing', data);
     } else {
       client.emit("typing", data);
       client.broadcast.emit('typing', data);
     }
  });

});

server.listen(4320);
