// Seriously awesome GLSL noise functions. (C) Credits and kudos go to
// Copyright (C) Stefan Gustavson, Ian McEwan Ashima Arts
// MIT License. 

define(function(require, exports){
	
	exports.hue2rgb = function hue2rgb(p, q, t){
		if(t < 0.) {
			t += 1.;
		}
		else {
			if(t > 1.) t -= 1.;
		}
		
		if(t < 1./6.) return p + (q - p) * 6. * t;
		if(t < 1./2.) return q;
		if(t < 2./3.) return p + (q - p) * (2./3. - t) * 6.;
		return p;
	}
			
	exports.hsla = function( hlsa){

		var h = hlsa.x;
		var s = hlsa.y;
		var l = hlsa.z;
		
		var r = 0.0;
		var g = 0.0;	
		var b = 0.0;

		if(s == 0.0){
			r = g = b = l; // achromatic
		}else{
			

			var q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
			var p = 2.0 * l - q;
			r = this.hue2rgb(p, q, h + 1./3.);
			g = this.hue2rgb(p, q, h);
			b = this.hue2rgb(p, q, h - 1./3.);
		}

		return  vec4(r,g,b,hlsa.w);
		
		
	}
})