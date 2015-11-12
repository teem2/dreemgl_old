// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class( function(view, label){
	// Markdown display class - this element can display a small subset of the "markdown" syntax. See the SUPPORTED_MARKDOWN.md file in the docviewer for supported elements.
	
	this.attributes = {
		// Body can be a single string or an array of strings - each string will be its own paragraph.
		body: {},
		
		// alignment of the bodytext. 
		// accepted values are "left", "right", "justify" and "center" 
		align: {type: String,  value: "left"},

		// Base fontsize - heading sizes will be multiples of this value.
		fontsize: {type:Number, value: 13},
		
		// The color to use as the default color for this textblock.
		fontcolor: {type:vec4, value: vec4("#202020")}
	}

	this.flexdirection = "column"

	var markdown = this.constructor
		define.example(this, function BasicUsage(){
			return [							
				markdown({align:"right", body:"# Heading on the right\nBodytext"})
				,markdown({align:"justify",body:"## Justified text\nShould space out neatly on the line."})
				,markdown({align:"left",body:"### Basic leftalignment\nAs usual"})
				,markdown({align:"center",body:"#### CENTER STAGE\nText in the middle"})
			]
		});

	
	// Create a set of visual elements for an array of textlines.
	this.BuildMarkdown= function(lines){
		var res = [];
		
		for(var a in lines)
		{				
			var L = lines[a];
			var LT = L.trim();
			if (LT.length == 0) continue;
		
			var fontsize = this.fontsize;
			var Margin = vec4(10,10,10,10);
			if (LT.indexOf("######") == 0){
				L = LT.substr(7);
				fontsize = this.fontsize * (16. / 14.);				
			} else if (LT.indexOf("#####") == 0){
				L = LT.substr(6);
				fontsize = this.fontsize * (18. / 14.);				
			} else if (LT.indexOf("####") == 0){
				L = LT.substr(5);
				fontsize = this.fontsize * (22. / 14.);				
			} else if (LT.indexOf("###") == 0){
				L = LT.substr(4);
				fontsize = this.fontsize * (25. / 14.);				
			} else if (LT.indexOf("##") == 0){
				L = LT.substr(3);
				fontsize = this.fontsize * (27. / 14.);				
			} else if (LT.indexOf("#") == 0){
				L = LT.substr(2);					
				fontsize = this.fontsize * (30. / 14.);				
			} else {
				// default text
			}
			
			res.push(label({fgcolor: this.fontcolor, margin: Margin, text: L, fontsize: fontsize, multiline: true, align: this.align}));
		}
		
		return res;
	}
	
	this.render = function(){
		if (!this.body) return [];
		if (typeof(this.body) === "array" || (this.body.length && typeof(this.body) !== "string" ) ){
				// join parts and do markup
				
			var lines = [];
			for(var i = 0;i<this.body.length;i++)
			{
				var splitted = this.body[i].split('\n')
				for(var j in splitted) lines.push(splitted[j]);
			}
				
			return this.BuildMarkdown(lines);;
		}
		else{				
			if (typeof(this.body) === "string"){
				
				var lines = [];
				var splitted = this.body.split('\n');
				for(var j in splitted) lines.push(splitted[j]);

				return this.BuildMarkdown(lines);
			}
			else{
				return [label({fgcolor:"#303030", text:"unknown format for body!\n\n" + this.body.toString(), multiline: true, fontsize:12})];
			}
		}
	}

});
