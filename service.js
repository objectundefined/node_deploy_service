var path = require('path');
var _ = require('underscore');
var fork = require('child_process').fork;
var format = require('util').format;
var carrier = require('carrier') ;
var sourcePath = '/home/ubuntu/source';
var nDeploy = require( path.join(sourcePath , 'nDeploy.json' ) );
var env = nDeploy && _.isObject(nDeploy.env) ? nDeploy.env : {};

env['PORT'] = 8080 ;

if ( nDeploy && _.isArray(nDeploy.processes) ) {
	
	nDeploy.processes.forEach(function(file){
		
		var proc = path.join(sourcePath,file);
		
		var child = fork( proc  ,[], {
		
			env : _.extend({},process.env,env) ,
			cwd : sourcePath
		
		});
		
		child.on('exit',function(){
			console.error('%s exited. Restarting services.',file);
		})
		
	});
	
}