define.class(function(require, shape3d){

	var GLGeom = require('$core/geometry/basicgeometry')

	this.attributes = {
		detail: vec2(40,40)
	}

	this.bg = {
		update:function(){
			var view = this.view
			this.mesh = this.vertexstruct.array();
			GLGeom.createPlane(view.width, view.height, view.detail[0], view.detail[1], function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
				this.mesh.push(v1,n1,t1);
				this.mesh.push(v2,n2,t2);
				this.mesh.push(v3,n3,t3);
			}.bind(this))
		}
	}
})
