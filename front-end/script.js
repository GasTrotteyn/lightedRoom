let widthField = document.getElementById("matrixWidth");
let heightField = document.getElementById("matrixHeight");
let visual = document.getElementById("visual");
let maker = document.getElementById("createMatrix");
let send = document.getElementById("send");
let matrix = [];

const createRow = (width) => {
    let row = [];
    for (let i = 0; i < width; i++) {
        row.push(0);
    }

    return row;
};

const createMatrix = (height, width) => {
    for (let i = 0; i < height; i++) {
        let newRow = createRow(width);
        matrix.push(newRow);
    }

    return matrix;
};

const displayMatrix = (mat) => {
    for (let i = 0; i < mat.length; i++) {
        let visualRow = document.createElement("div");
        visualRow.classList.add("newRow");
        for (let e = 0; e < mat[i].length; e++) {
            let newElem = document.createElement("input");
            newElem.setAttribute("type", "checkbox");
            newElem.classList.add("square");
            newElem.setAttribute("id", `${i}:${e}`);
            visualRow.appendChild(newElem);
        }
        visual.appendChild(visualRow);
    }
};

const clearMatrixValues = () => {
    widthField.value = null;
    heightField.value = null;
};

const display = () => {
    visual.innerHTML = null;
    let an = widthField.value;
    let al = heightField.value;
    matrix = createMatrix(al, an);
    displayMatrix(matrix);
    matrix = [];
    clearMatrixValues();
};

const makePayload = () => {
    let payload = {};
    let height = visual.childElementCount;
    payload.height = height;
    let width = visual.children[0].children.length;
    payload.width = width;
    let detalle = document.getElementsByClassName("square");
    let deta = [...detalle];
    payload.data = [];
    deta.map((square) => {
        let info = {
            coord: square.id,
            value: square.checked,
        };
        payload.data.push(info);
    });

    return payload;
};

const getRow = (data, index) => {
    let row = data.filter((square) => {
        return square.row == index;
    });

    return row;
};

const respToArray = (resp) => {
    let result = [];
    let ind = 0;
    let currentRow = [];
    do {
        currentRow = getRow(resp, ind);
        result.push(currentRow);
        ind++;
    } while (currentRow[0]);
    result.pop();

    return result;
};

const displaySolution = (resp) => {
    let matrixArray = respToArray(resp);
    let result = document.getElementById("result");
    result.classList.add("solution");
    matrixArray.map((row) => {
        let newRow = document.createElement("div");
        newRow.classList.add("solutionRow");
        row.map((square) => {
            let newElem = document.createElement("div");
            newElem.classList.add("square");
            if (square.isWall) {
                newElem.classList.add("wall");
            }
            if (square.illuminated) {
                newElem.classList.add("illuminated");
            }
            if (square.isLight) {
                newElem.classList.add("bulb");
            }
            newRow.appendChild(newElem);
        });
        result.appendChild(newRow);
    });
    matrix = [];
};

const submit = async () => {
    const data = makePayload();
    const payload = await JSON.stringify(data);

    fetch("http://localhost:3001/matrix", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: payload,
    })
        .then((resp) => {
            return resp.json();
        })
        .then((respOk) => {
            displaySolution(respOk);
        })
        .catch((error) => {
            console.log(error);
        });
};

maker.addEventListener("click", display);
send.addEventListener("click", submit);
