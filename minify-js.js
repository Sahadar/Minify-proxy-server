var fs = require('fs'),
    path = require("path"),
    exec = require('child_process').exec;

function readFromCache( file, html )
{
	if ( path.existsSync( file ) ) {
		html = fs.readFileSync( file );
	}

	return html;
}


module.exports = function(request, result, html, callback, host, type)
{
	var folderName = './cache';
	var file = folderName+'/'+host+request.url.replace(/\//g, '_')+'.cache';
	
	if(!path.existsSync(folderName)) {
		exec('mkdir cache');
	}


	if ( path.existsSync( file ) ) {
		console.log('Read from cache: ', file);
		return callback( readFromCache( file, html ) );
	} else {
		console.log('Creating file: ', file);
		fs.writeFileSync(file, html);
		var cmd = 'java -jar ./yuicompressor/build/yuicompressor-2.4.6.jar --type '+type+' '+file+' -o '+file;
		exec(cmd, function(error, stdout, stderr){
			if ( error ) {
				console.log('NIE SKOMPRESOWANO JS ', file);
			}
			callback( readFromCache( file, html ) );
		});
	}
}
