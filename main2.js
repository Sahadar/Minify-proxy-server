const	express = require('express'),
	fs = require("fs"),
	http = require('http'),
	exec = require('child_process'),
	querystring = require('querystring'),
	jsdom = require('jsdom'),
	photoManager = require('./photo-manager');



var server = http.createServer(function(req, res) {
	var host = "192.168.118.1";
		var options = {
		host: host,
		port: 80,
		path: req.url,
		//headers: req.headers,
		headers: {
			//'referer' : req.headers['referer'],
			'cache-control': req.headers['cache-control'],
			'if-modified-since': req.headers['if-modified-since'],
  			'if-none-match': req.headers['if-none-match'],
			'user-agent' : req.headers['user-agent'],
			'accept-charset' : req.headers['accept-charset']
		},
		method: req.method
	};
	
	if(typeof req.headers['content-length'] !== 'undefined') {
		options.headers['content-length'] = req.headers['content-length'];
	}
	
	req.content = '';
	req.postData = '';
	
	req.addListener('data', function(chunk) {
		if ( req.method == 'POST' ) {
			req.postData += chunk;
			return ;
		}// endif
		
		req.content += chunk;
	});
	req.addListener('end', function() {
		if ( req.method == 'POST' ) {
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} // endif
		//console.log(req.headers);
		isGraphic = options.path.match(/(png|gif|jpg)/) !== null;
		var proxy = http.request(options, function(result) {
			var html = '';
			var count = 0;
			var isHtml = result.headers['content-type'] === 'text/html';
			//var isGraphic = result.headers['content-type'].match(//);
			
			//var isHtml = 'undefined' !== result.headers['content-type'] && 'text/html' == result.headers['content-type'];
			
			//console.log("result: \n", result.headers['connection']);
			//console.log("result-Code: \n", result.statusCode);
			//res.write(req.content);
			
			//res.writeHead(200, result.headers);
			res.writeHead(result.statusCode, result.headers);
			
			console.log('url z ktorego pobieramy dane: ', req.url);
						
			result.on('data', function(cont) {
				if(isHtml) {
					count++;	
				}
				if(isGraphic) {
				/*	photoManager(cont, function( html ){
						res.write(html);
						res.end();
					}, 'part'); */
					return res.write(cont);
					//html += cont;
				}
				html += cont;
			});
			
			result.on('error', function(e) {
				console.log("Got error: " + e.message);
			});
			
			result.on('end', function() {
				if(isHtml) {
					//console.log(html);
				}
				if(isGraphic) {
					return res.end();	
				}
				switch (result.headers['content-type']) {	
					case 'text/html': 
	                       			/*
						var dom = jsdom.jsdom(html);
	                       			var window = dom.createWindow();
			                       	window.console = console;
	                       			window.run(require('fs').readFileSync('jquery.js', 'utf-8'));
	                       			window.run('$("title").html("Kopytko");');
	                       			window.run('console.log($("title").html());');
	                       	
	                       			html = window.document.innerHTML;
						*/
					
						require('./minify-html')(req, result, html, function( html ){
							//console.log(html.toString());
							res.write(html);
	    					//console.log("end");
		    				res.end();
						}, host);
						break;
					case 'application/javascript':
						require('./minify-js')(req, result, html, function( html ){
							console.log('url', req.url);
							console.log(typeof html);
							//console.log(html.toString())
							res.write(html);
	    					//console.log("end");
		    				res.end();
						}, host, 'js');
						break;
					
					case 'text/css':
						require('./minify-js')(req, result, html, function( html ){
							res.write(html);
	    					//console.log("end");
		    				res.end();
						}, host, 'css');
						break;
						
					default:
						res.write(html.toString());
    					//console.log("end");
	     				res.end();
				}
			});
		});
		
		if ( req.method == 'POST' ) {
			proxy.write( req.postData );
		}

		proxy.end();
	});
}).listen(3000, '127.0.0.1');
