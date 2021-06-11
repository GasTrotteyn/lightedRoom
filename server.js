const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

//This allow requests from the frontend
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const extractCoord = (data) => {
    let extracted = [];
    data.map((item) => {
        let row = item.coord.charAt(0);
        let column = item.coord.charAt(2);
        let value = item.value;
        let newItem = {
            row: row,
            column: column,
            isWall: value,
            isLight: false,
            illuminated: false,
        };
        extracted.push(newItem);
    });

    return extracted;
};

//put ligths (not allowed on walls) //

const putLights = (data, lights) => {
    let withLights = [...data];
    lights.map((light) => {
        withLights.map((square) => {
            if (
                light.row == square.row &&
                light.column == square.column &&
                !square.isWall
            ) {
                square.isLight = true;
            }
        });
    });

    return withLights;
};

const getRowOfLight = (data, item) => {
    let row = data.filter((square) => {
        return square.row == item.row;
    });

    return row;
};

const getColumnOfLight = (data, item) => {
    let column = data.filter((square) => {
        return square.column == item.column;
    });

    return column;
};

//show the room with courrent ilumination //

const turnOnLights = (data) => {
    let lightedRoom = [...data];
    lightedRoom.map((item) => {
        if (item.isLight) {
            //get the row which has the light and find the light position ///
            let row = getRowOfLight(lightedRoom, item);
            let i = item.column;

            //turn the light to the right untill find a wall or the end of row///
            while (i < row.length && !row[i].isWall) {
                //console.log("uno iluminado a la derecha");
                row[i].illuminated = true;
                i++;
            }

            //find the position again and turn the light to the left untill find a wall or the end of row ///
            let i2 = item.column;
            while (i2 >= 0 && !row[i2].isWall) {
                row[i2].illuminated = true;
                i2 = i2 - 1;
            }

            //update the value of illuminated in each square of the matrix //
            row.map((elem) => {
                lightedRoom.map((square) => {
                    if (
                        square.row == elem.row &&
                        square.column == elem.column
                    ) {
                        square.illuminated = elem.illuminated;
                    }
                });
            });

            //get the column which has the light and find the light position  //
            let column = getColumnOfLight(lightedRoom, item);
            let i3 = item.row;

            //turn the light (down direction) untill find a wall or the end of row///
            while (i3 < column.length && !column[i3].isWall) {
                column[i3].illuminated = true;
                i3++;
            }

            //find the position again and turn the light (up direction) untill find a wall or the end of row ///
            let i4 = item.row;
            while (i4 >= 0 && !column[i4].isWall) {
                column[i4].illuminated = true;
                i4 = i4 - 1;
            }

            //update the value of illuminated in each square of the matrix//
            column.map((elem) => {
                lightedRoom.map((square) => {
                    if (
                        square.row == elem.row &&
                        square.column == elem.column
                    ) {
                        square.illuminated = elem.illuminated;
                    }
                });
            });
        }
    });

    return lightedRoom;
};

const isFullyIluminated = (data) => {
    let result = true;
    data.map((square) => {
        if (!square.illuminated && !square.isWall) {
            result = false;
        }
    });

    return result;
};

const searchFirstDark = (data) => {
    let dark = {};
    data.map((square) => {
        if (!square.illuminated && !square.isWall && !dark.row) {
            dark = square;
        }
    });

    return dark;
};

const smartLight = (data) => {
    let result = [...data];
    let finished = false;
    while (!finished) {
        ///this line makes the search start at the end or beginning of the array each time.///
        // result = result.reverse();

        let dark = [searchFirstDark(result)];
        let roomWithBulbs = putLights(result, dark);
        let roomIluminated = turnOnLights(roomWithBulbs);
        finished = isFullyIluminated(roomIluminated);
    }
    let final = [...result];
    if (final[0].row != 0) {
        final = final.reverse();
    }

    return final;
};

app.post("/matrix", (req, res) => {
    const matriz = req.body;
    const roomWithWalls = extractCoord(matriz.data);
    const result = smartLight(roomWithWalls);

    res.status(201);
    res.json(result);
});

app.listen(3001, () => {
    console.log("server running!");
});
