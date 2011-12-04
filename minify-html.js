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


module.exports = function(request, result, html, callback, host)
{
	var cacheFolder = './cache';
	var file = cacheFolder+'/'+host+request.url.replace(/\//g, '_')+'html';
	if(!path.existsSync(file)) {
		exec('mkrid cache');
	}
	
	fs.writeFileSync(file, html);
	var cmd = 'java -jar ./htmlcompressor/bin/htmlcompressor-1.5.2.jar '+file+' -o '+file;
	exec(cmd, function(error, stdout, stderr){
		if ( error ) {
			console.log('NIE SKOMPRESOWANO HTML', file);
		}
		callback( readFromCache( file, html ) );
	});
}
