// MIT License. 

define(function(require, exports){	
	// Use material-capture "lit sphere" texture to approximate material behaviour for a surface.
	exports.matcap = function(eye, normal){	
		var r = reflect( eye, normal );
		return r.xy;
		var m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
		var vN = r.xy / m + .5;		
		return vN;
	}	
})