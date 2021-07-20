# lightedRoom

There is an electrician who has to light a room. The room will have different dimensions every day and can have interior walls that complicate the work. In addition, its bulbs can only illuminate to the sides, up and down, but never diagonally. This repo contains a front-end that allows the user to generate a room with as many rows and columns as they choose and add the interior walls they want. The back-end processes this information with a simple algorithm: it looks for the first dark cell, places a light on it, turns it on, evaluates if the room is fully lit, and starts the process again from the opposite end of the room. In this way you save bulbs by placing them only in places that are still dark.

1 -  clone repository: https://github.com/GasTrotteyn/lightedRoom.git

2 - cd lightedRoom.

3 - npm install.

4 - Open server.js in VSC and run node server.js in a new terminal.

5 - Open Front-end folder in other VSC and run it with Go-Live.
