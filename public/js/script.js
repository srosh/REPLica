var socket,editor,history=[],hindex =-1;
var sendCode = function(text) {
  existsatindex =history.lastIndexOf(text);
  if(existsatindex>-1 && existsatindex==history.length-1) { /* don't add to history */ }
  else history.push(text);
  var lines = text.replace(/\n+|\n[\t ]+\n/g,'\n').split('\n');
  socket.emit('input', { 'lines':lines  });
  while (!(history.length<maxhistorylen)) history.shift();
  hindex = history.length;
}
var scrollOutput = function () {
  var out = document.getElementById('outputContainer');
  out.scrollTop = out.scrollHeight;
}
var nullClick = function (el) {
  window.event.stopPropagation();
  return false;
}
var insert = function (el) {
  var text = isNaN(el) ? el.textContext || el.innerText : el;
  if(!isNaN(text) || text.match(/^\'.+\'$/)) text= '['+text+']';
  else text= '.'+text; 
  editor.getSession().insert(editor.getSelection().getCursor(),text);
  console.log(text);
  return nullClick(el);
}
var expand = function (el) {
  el.classList.toggle('expanded');
  return nullClick(el);
}
var seteditor = function(editor) {
  editor.getSession().setMode("ace/mode/javascript");
  editor.setTheme("ace/theme/solarized_light");
  editor.commands.addCommands([{
    name: "run",
    bindKey: {
        win: "Ctrl-Return",
        mac: "Command-Return"
    },
    exec: function(editor, line) {
        var code = editor.getSession().getValue();
        editor.getSession().setValue('');
        sendCode(code);
        return true;
    },
    readOnly: false
  },{
    name: "hup",
    bindKey: {
        win: "Ctrl-Up",
        mac: "Command-Up"
    },
    exec: function(editor, line) {
      if(hindex>0) {
        hindex--;
        editor.getSession().setValue(history[hindex]);
      }
      return true;
    },
    readOnly: false
  },{
    name: "hdown",
    bindKey: {
        win: "Ctrl-Down",
        mac: "Command-Down"
    },
    exec: function(editor, line) {
      if(hindex<history.length) {
        hindex++;
        editor.getSession().setValue(history[hindex]);
      } else { editor.getSession().setValue(''); }
      return true;
    },
    readOnly: false
  }]);
document.getElementById('editorContainer').classList.remove('closed');
}

window.onload=function() {
  socket = io.connect('http://'+host+':'+port);
  socket.on('input', function (data) {
    if(editor) editor.getSession().setValue(data);
  });
  socket.on('output', function (data) {
      var output = document.getElementById('output');
      output.innerHTML+=data;
      scrollOutput();
  });
  editor = ace.edit("editor");
  setTimeout(function(){seteditor(editor);},100);
}