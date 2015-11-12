# Dreem GL 

To start dreemGL type

node server.js

Intro presentation

http://127.0.0.1:2000/introduction

To try livecoding a shader open this:

http://127.0.0.1:2000/rendertest
and open compositions/rendertest.js.js in your editor and start typing away and saving, reload should be live.

As the server starts, it also shows other local IP's its listening on (for trying it on your phone)
Open http://<mylocalip>:2000/imagesearch on your mobile device to livecode shaders from your laptop to your phone.

Have fun!

Attribution list of modules and libraries used:

Facebook flexbox layout: /lib/layout.js - Copyright (c) 2014, Facebook, Inc. BSD license
Acorn JS: /lib/acorn.js - Acorn was written by Marijn Haverbeke and released under an MIT license.
Coffee-script.js /lib/coffee-script.js - Copyright 2011, Jeremy Ashkenas Released under the MIT License
Shader noise function /core/shaderlib/noiselib.js - Inspired by Stefan Gustavson, Ian McEwan Ashima Arts MIT License
Shader compiler: /core/draw/shader.js - Based on work by Rik Arends, Apache 2 license
Glyphy: /core/fonts/fontshader.js - Based on work by Behdad Esfahbod, Google, Apache 2 license