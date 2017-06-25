Files = Files == undefined ? {} : Files
Files.getFileList = function(){	
	var fs = require('fs');
	var path = require('path');
	var walk = function(dir, onFile, onDir, done) {
	  fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) return done(null);
		list.forEach(function(sPath) {
		  sPath = path.resolve(dir, sPath);
		  fs.stat(sPath, function(err, stat) {
			if (stat && stat.isDirectory()) { //isDirectory
			  onDir(sPath)
			  walk(sPath,onFile, onDir, function(err) {
				if (!--pending) done(null);
			  });
			} else { //isFile
			  onFile(sPath)
			  if (!--pending) done(null);
			}
		  });
		});
	  });
	};
	
}


Files.walk('C:\\',function(file){console.log("File:"+file)},function(dir){console.log("Dir:"+dir)},function(){console.log("All Done!")})



/*
	var fs = require('fs');
	var path = require('path');
	var walk = function(dir, done) {
	  var results = [];
	  fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) return done(null, results);
		list.forEach(function(file) {
		  file = path.resolve(dir, file);
		  fs.stat(file, function(err, stat) {
			if (stat && stat.isDirectory()) {
			  walk(file, function(err, res) {
				results = results.concat(res);
				if (!--pending) done(null, results);
			  });
			} else {
			  results.push(file);
			  if (!--pending) done(null, results);
			}
		  });
		});
	  });
	};
*/