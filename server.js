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
        if (item.coord.length === 3) {
            let row = parseInt(item.coord.charAt(0));
            let column = parseInt(item.coord.charAt(2));
            let value = item.value;
            let newItem = {
                row: row,
                column: column,
                isWall: value,
                isLight: false,
                illuminated: false,
            };
            extracted.push(newItem);
        } else if (item.coord.length === 4) {
            let sepIndex = item.coord.indexOf(":");
            if (sepIndex === 2) {
                let array = [];
                let row0 = item.coord.charAt(0);
                let row1 = item.coord.charAt(1);
                array.push(row0);
                array.push(row1);
                let row = parseInt(array.join(""));
                let column = parseInt(item.coord.charAt(3));
                let value = item.value;
                let newItem = {
                    row: row,
                    column: column,
                    isWall: value,
                    isLight: false,
                    illuminated: false,
                };
                extracted.push(newItem);
            }
            if (sepIndex === 1) {
                let array = [];
                let col1 = item.coord.charAt(2);
                let col2 = item.coord.charAt(3);
                array.push(col1);
                array.push(col2);
                let column = parseInt(array.join(""));
                let row = parseInt(item.coord.charAt(0));
                let value = item.value;
                let newItem = {
                    row: row,
                    column: column,
                    isWall: value,
                    isLight: false,
                    illuminated: false,
                };
                extracted.push(newItem);
            }
        } else if (item.coord.length === 5) {
            let array = [];
            let row0 = item.coord.charAt(0);
            let row1 = item.coord.charAt(1);
            array.push(row0);
            array.push(row1);
            let row = parseInt(array.join(""));
            let array2 = [];
            let col1 = item.coord.charAt(3);
            let col2 = item.coord.charAt(4);
            array2.push(col1);
            array2.push(col2);
            let column = parseInt(array2.join(""));
            let value = item.value;
            let newItem = {
                row: row,
                column: column,
                isWall: value,
                isLight: false,
                illuminated: false,
            };
            extracted.push(newItem);
        }
    });

    return extracted;
};

//put ligths (not allowed on walls) //

const putLights = (data, dark) => {
    let withLights = [...data];
    for (let i = 0; i < withLights.length; i++) {
        if (
            dark.row == withLights[i].row &&
            dark.column == withLights[i].column &&
            !withLights[i].isWall
        ) {
            withLights[i].isLight = true;
            break;
        }
    }

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
    data.forEach((square) => {
        if (!square.illuminated && !square.isWall) {
            result = false;
        }
    });

    return result;
};

const searchFirstDark = (data) => {
    let dark = {};
    for (let i = 0; i < data.length; i++) {
        if (!data[i].illuminated && !data[i].isWall) {
            dark = data[i];
            break;
        }
    }

    return dark;
};

const smartLight = (data) => {
    let reverseThisTime = false;
    let result = [...data];
    let finished = false;
    while (!finished) {
        if (reverseThisTime) {
            result.reverse();
        } else {
            reverseThisTime = true;
        }
        let dark = searchFirstDark(result);
        if (result[0].row != 0) {
            result.reverse();
        }

        let roomWithBulbs = putLights(result, dark);
        let roomIluminated = turnOnLights(roomWithBulbs);
        result = roomIluminated;
        finished = isFullyIluminated(roomIluminated);
    }
    let final = [...result];
    if (final[0].row != 0) {
        final = final.reverse();
    }
    console.log("full illuminated!!");
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
