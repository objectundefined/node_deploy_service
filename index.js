var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var fork = require('child_process').fork;
var format = require('util').format;
var carrier = require('carrier') ;
var sourcePath = '/home/ubuntu/source';
var nDeploy = require( path.join(sourcePath , 'nDeploy.json' ) );
var env = nDeploy && _.isObject(nDeploy.env) ? nDeploy.env : {};

env['PORT'] = 8080 ;

if ( nDeploy && _.isArray(nDeploy.processes) ) {
	
	nDeploy.processes.forEach(function(proc){
		
		var file , keepAlive ;
		
		if ( _.isString( proc ) ) {
			
			file = path.join( sourcePath , proc ) ;
			
		} else if ( _.isObject( proc ) && proc.file ) {
			
			file = path.join( sourcePath , proc.file ) ;
			
			keepAlive = proc.keepAlive || false ;
			
		} else {
			
			console.error("Process %s not valid." , JSON.stringify(proc) );
			return;
		}
		
		if ( fs.existsSync( file ) ) {
			
			var child = new Child( file , keepAlive );
			
		} else {
			
			console.error("File %s does not exist.",file);
			
		}
		
	});
	
}

function Child(proc,keepAlive){
	
	this.createChild(proc,keepAlive);
	
	return this ;
	
};

Child.prototype.createChild = function(proc,keepAlive){
	
	var _this = this ;
	_this.process = fork( proc  ,[], {
		
		env : _.extend({},process.env,env) ,
		cwd : sourcePath
		
	});

	if ( keepAlive ) {
		
		_this.process.on('exit',function(){
			console.log( "Child %s exited. Restarting." , proc )
			_this.process = _this.createChild( proc , keepAlive );
			
		})
		
	}
	
};