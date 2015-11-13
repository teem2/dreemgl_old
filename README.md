# Dreem GL

DreemGL is an open source JS webGL and DALi (Dynamic Animation Library; a cross-platform 3D UI Toolkit) prototyping framework with 
shader styling and render functions.

To start dreemGL type

```node server.js```

Intro presentation

[http://127.0.0.1:2000/introduction](http://127.0.0.1:2000/introduction)

To try livecoding a shader open this:

[http://127.0.0.1:2000/rendertest](http://127.0.0.1:2000/rendertest) and open 
[compositions/rendertest.js](compositions/rendertest.js) in your editor and start typing away and saving, reload should 
be live.

As the server starts, it also shows other local IP's its listening on (for trying it on your phone)

Have fun!


## License
This software is licensed under the  Apache License, Version 2.0. You will find the terms in the file named 
["LICENSE.md"](LICENSE.md) in this directory.

### Attribution list of modules and libraries used:
Facebook flexbox layout: /lib/layout.js  
Flexbox layout JavaScript module. Copyright (c) 2014, Facebook, Inc. BSD license  

Acorn JS: /lib/acorn.js  
Acorn JavaScript parser. Written by Marijn Haverbeke, released under an MIT license.  

CoffeeScript: /lib/coffee-script.js 
CoffeeScript language, copyright 2011, Jeremy Ashkenas. Released under the MIT License. 
 
  
Shader noise function /core/shaderlib/noiselib.js
Inspired by Stefan Gustavson, Ian McEwan, Ashima Arts. Released under MIT License.  
  
Shader compiler: /core/draw/shader.js
Based on work by Rik Arends. Relesaed under Apache 2.0 license  