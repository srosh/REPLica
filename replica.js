var express = require('express')
  , app = express()
  , http = require('http')
  , fs = require('fs')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , instances = {}
  , instanceNames = {}
  , Stream = require('stream')
  , repl = require('./mock-repl')
  , inspect = require('./mock-util').inspect
  , settings

try {
  settings = require('./settings.json') 
} catch (e) {
  console.warn('Couldn\'t load settings.json\n',e);
  settings = {port:8033,server:'localhost',dir:'playground',folding:{level:0},io:{loglevel:1},history:{max:33}};
}
// if(process.argv[2]) settings.dir=process.argv[2]; // set working dir from argv?
io.set('log level', settings.io.loglevel);
server.listen(settings.port);
console.log("REPLica started listening on port "+settings.port);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});
app.get('/settings.js', function (req, res) {
  res.set('Content-Type', 'text/javascript');
  res.send('var host=location.hostname,port='+settings.port+',maxhistorylen='+settings.history.max+';');
  //res.send('var host="'+settings.server+'",port='+settings.port+',maxhistorylen='+settings.history.max+';');
});

if(settings.dir) process.chdir(settings.dir);

io.sockets.on('connection', function (socket) {
  var wstream = makeWriteStream(socket);
  var rstream = makeReadStream(socket,wstream);
  var replSettings = {prompt: '<span class="prompt">&gt; </span>',input: rstream,output: wstream,useColors:true,replica:{'instanceNames':instanceNames,id:socket.id,'settings':settings}};
  var instance = repl.start(replSettings);
  instances[socket.id] = instance; // useful in case shared contexts are added
  socket.on('disconnect', function() {
    //console.log(socket.id+' was closed');
    delete instances[socket.id];
  });
});

var escapeHTML = function (text) {
   var res = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
   return res;
}
var processRaw = function(raw) {
  var lines = raw.split('\n');
  var res = '';
  //console.log(lines);
  if (lines.length>0 && !raw.match(/^\.+\s/)) {
    res += '<a class="collapsed colorred" onclick="return extend(this);">'+escapeHTML(lines[0]);
    res += '<p class="trace bgcolorbase02 colororange" onclick="return false;">'+lines.slice(1).join('<br/>')+'</p></a>';
  } else {
    res += '<span class="prompt">'+escapeHTML(lines[0])+'</span>';
  }
  return res;
}
var makeWriteStream = function(socket) {
  var strm = new Stream();
  strm.writable = true;
  strm.write = function(data) {
    socket.emit('output', data);
  };
  return strm;
}
var makeReadStream = function(socket,outstream) {
  var strm = new Stream();
  strm.readable = true;
  strm.writable = true;
  strm.resume = function() {};
  strm.pause = function() {
    socket.disconnect();
  };
  strm.write = function(data) {
    socket.emit('input', data);
  }
  socket.on('input', function(data) {
    var cmds = data.lines;
    while(cmds.length>0) {
      var cmd = cmds.shift();
      outstream.write('<span class="input">'+cmd.replace(/^\s+/g,'')+'</span><br/>');
      strm.emit('data', cmd+'\n');
    }
  });
  return strm;
};