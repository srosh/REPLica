REPLica: NodeJS REPL + ACE
===
REPlica is a NodeJS REPL server with multiline input and code folding for objects and arrays in console.

### Installation
Clone from git repo and run `npm install` to get the dependencies

	$ git clone git://github.com/srosh/REPLica.git
	$ cd REPLica
	REPLica$ npm install

### Usage
Run replica from the directory by `npm start` or `node replica`

	REPLica$ npm start

or

	REPLica$ node replica

By default REPLica tries to listen to port 8033 on localhost you can change this in `settings.json`.

Then just navigate your web browser to <http://localhost:8033>.


Write your code in the editor (bottom) and press `cmd+Return` (`ctrl+Return` in Windows) to run it.

You can use `cmd+Up` or `cmd+Down` ( `ctrl+Up` / `ctrl+Down` for Windows ) to go through sent codes.

Almost everything else is like the Node REPL except that you can in interact with objects and arrays printed out in the console.

Clicking on `{` `}` or `[` `]` expands/collapses the representation. Also clicking on Array members or Object keys inserts the key at cursor in the editor.

### Extra REPL Commands
`.read file` loads a file to the editor

	.read /path/to/file.js

`.def obj` copies the definition of a function or object/array data into the editor

	var obj = { a : [ 1, 2, 3, [4]] }
	.def obj

`.export name` exports the current context and makes it accessible to other instances of replica

	.export context1

`.import name` imports another context ( name ) to a variable in current context with the same name

	.import context1
	
So you can use that context's variables etc. in current context. For example

	context1.console.log('hello context1');

shows `'hello context1'` in the exported context `context1`




***
### License
MIT