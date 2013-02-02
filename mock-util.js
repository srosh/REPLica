// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
for (var key in util) {
  exports[key] = util[key];
}

var formatRegExp = /%[sdj%]/g;
var format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


var objType = function(obj) {
  var type = Object.prototype.toString.call(obj);
  return type.match(/\[object ([^\]]+)\]/)[1];
}

var inspect = function(obj, showHidden, depth, colors,parents,foldAt) {
  showHidden = false;
  colors = true;
  if (foldAt===undefined || foldAt===null) foldAt=0;
  if (parents===undefined) parents = [];
  if (depth===undefined) depth = null; // defaults to null
  // var res = require('util').inspect(obj,showHidden,depth,false);
  var res  = '';
  var type ;
  if (parents.indexOf(obj)>-1) type = 'Circular';
  else type= objType(obj);
  switch(type) {
    case 'Null':
    return '<span class="null ">null</span>';
    break;
    case 'Undefined':
    return '<span class="undefined ">undefined</span>';
    break;
    case 'Boolean':
    return '<span class="boolean ">'+(obj ? 'true':'false')+'</span>';
    break;
    case 'Number':
    return '<span class="number ">'+obj+'</span>';
    break;
    case 'String':
    return '<span class="string ">'+require('util').inspect(obj)+'</span>';
    break;
    case 'RegExp':
    return '<span class="rejexp ">'+obj+'</span>';
    break;
    case 'Function':
    res+= '<span class="function collapsed" onclick="return expand(this);"><span class="description">(Function)</span><span class="closer">(-)<br/></span><ul onclick="return nullClick(this);">';
    var lines = obj.toString().split('\n');
    while (lines.length>0) res+= '<li>'+lines.shift()+'</li>';
    res+= '</ul></span>';
    break;
    case 'Array':
    if (depth==0) return '<span class="array ">(Array)</span>';
    res += '<span class="array collapsed'+(parents.length<foldAt ? ' expanded' : '')+'" onclick="return expand(this);">[<ul onclick="return nullClick(this);">'
    var count = 0;
    for (var key in obj) {
      if (isNaN(key)) {
        res += (count>0 ? ' , </li>' : '');
        res += '<li><span class="keyname" onclick="return insert(this);">\''+key+'\'</span> : '+inspect(obj[key],showHidden,(depth!==null ? depth-1 : null),colors,parents.concat([obj]),foldAt);
        count++;
      }
    }
    // to get undefined els
    for (var key=0;key<obj.length;key++) {
      res += (count>0 ? ' , </li>' : '');
      res += '<li onclick="return insert('+key+');">'+inspect(obj[key],showHidden,(depth!==null ? depth-1 : null),colors,parents.concat([obj]),foldAt);
      count++;
    }
    res += '</li></ul>]</span>';
    break;
    case 'Object':
    if (depth==0) return '<span class="object ">(Object)</span>';
    res += '<span class="object collapsed'+(parents.length<foldAt ? ' expanded' : '')+'" onclick="return expand(this);">{<ul onclick="return nullClick(this);">';
    var count = 0;
    for (var key in obj) {
      res += (count>0 ? ' , </li>' : '');
      res += '<li><span class="keyname" onclick="return insert(this);">'+key+'</span> : '+inspect(obj[key],showHidden,(depth!==null ? depth-1 : null),colors,parents.concat([obj]),foldAt);
      count++;
    }
    res += '</li></ul>}</span>';
    break;
    case 'Circular':
    return '<span class="circular ">(Circular)</span>';
    break;
    default: return '[object '+type+']';//util.inspect(obj);
  }
  return res;
}
exports.def = function (obj) {
  if (objType(obj)=='Function') return obj.toString();
  else return (util.inspect(obj,false,null));
}

exports.format = format;
exports.inspect = inspect;