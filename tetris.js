const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

let arena = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

// действие
function updateScore(value) {
    playerCopy = _.cloneDeep(player)
    playerCopy.score = value
    player = playerCopy;
    updateScoreDom(value);
}

// действие
function updateScoreDom(value) {
    document.getElementById('score').innerText = value;
}

// действие
function updatePlayerPosition({ xOffset = 0, yOffset = 0 } = { xOffset: 0, yOffset: 0 }) {
    playerCopy = _.cloneDeep(player);
    playerCopy.pos.x += xOffset;
    playerCopy.pos.y += yOffset;
    return playerCopy
}

// действие
function drawArena() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    arena.forEach((row, indexRow) => {
        row.forEach((el, indexCol) => {
            if (el !== 0) {
                context.fillStyle = colors[el];
                context.fillRect(indexCol, indexRow, 1, 1);
            };
        });
    });
}

// действие
function drawPlayer() {
    player.matrix.forEach((row, indexRow) => {
        row.forEach((el, indexCol) => {
            if (el !== 0) {
                context.fillStyle = colors[el];
                context.fillRect(indexCol + player.pos.x, indexRow + player.pos.y, 1, 1);
            };
        });
    });
}

// данные
function getAllAvailablePieces() {
    return [
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ], [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ], [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ], [
            [4, 4],
            [4, 4],
        ], [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ], [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ], [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ]
    ]
}

// вычисление
function createPiece() {
    return _.shuffle(getAllAvailablePieces())[0]
}

// вычисление
function isRowFilled(rowArray) {
    return rowArray.every((el) => el !== 0)
}

// вычисление
function getFilledRowsNumbers(array) {
    return _.keys(_.pickBy(array, isRowFilled));
}

// вычисление
function removeRowsNumbers(arena, rowNumsArray) {
    const arenaCopy = _.cloneDeep(arena);
    rowNumsArray.forEach(el => {
        const row = arenaCopy.splice(el, 1)[0].fill(0);
        arenaCopy.unshift(row);
    });
    return arenaCopy
}

// действие
function arenaSweep(arena, player) {
    let rowsToBeDeleted = getFilledRowsNumbers(arena);
    updateScore(player.score + rowsToBeDeleted.length * 10)
    return removeRowsNumbers(arena, rowsToBeDeleted);
}

// вычисление
function collide(arenaArr, playerObj) {
    const matrix = playerObj.matrix;
    const playerPos = playerObj.pos;
    let result = false;
    matrix.forEach((row, indexRow) => {
        row.forEach((el, indexCol) => {
            if (el !== 0 && (arenaArr[indexRow + playerPos.y] && arenaArr[indexRow + playerPos.y][indexCol + playerPos.x]) !== 0) {
                result = true;
            }
        })
    })
    return result;
}

// вычисление
function createMatrix(w, h) {
    return Array.from(Array(h), () => new Array(w).fill(0));;
}

// вычисление
function merge(arena, player) {
    const arenaCopy = _.cloneDeep(arena);
    player.matrix.forEach((matrixRow, indexRow) => {
        matrixRow.forEach((el, indexCol) => {
            if (el !== 0) {
                arenaCopy[indexRow + player.pos.y][indexCol + player.pos.x] = el;
            };
        });
    });
    return arenaCopy
}

// вычисление
function rotate(matrix, dir) {
    const matrixCopy = _.zip(..._.cloneDeep(matrix))

    if (dir > 0) {
        matrixCopy.map(el => el.reverse());
    } else {
        matrixCopy.reverse();
    }
    return matrixCopy
}

// действие
function playerDrop() {
    player = updatePlayerPosition({ yOffset: 1 })
    if (collide(arena, player)) {
        player = updatePlayerPosition({ yOffset: -1 });
        arena = merge(arena, player);
        player = playerReset(arena, player);
        if (collide(arena, player)) {
            startGame();
        }
        arena = arenaSweep(arena, player);
        updateScore(player.score);
    }
    dropCounter = 0;
}

// действие
function playerMove(offset) {
    player = updatePlayerPosition({ xOffset: offset })
    if (collide(arena, player)) {
        player = updatePlayerPosition({ xOffset: -offset })
    }
}

// вычисление
function playerReset(arenaArr, playerObj) {
    const newPlayer = new Object();
    newPlayer.matrix = createPiece();
    newPlayer.pos = new Object();
    newPlayer.pos.y = 0;
    newPlayer.pos.x = getXCenterPosition(arenaArr, newPlayer.matrix);
    newPlayer.score = playerObj.score;
    return newPlayer
}

// вычисление
function getXCenterPosition(arenaArr, figureArr) {
    return (arenaArr[0].length / 2 | 0) - (figureArr[0].length / 2 | 0);
}

// действие
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    player.matrix = rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player = updatePlayerPosition({ xOffset: offset });
        if (offset > player.matrix[0].length) {
            player.matrix = rotate(player.matrix, -dir);
            player.pos.x = pos;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

// действие
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    };

    lastTime = time;

    drawArena();
    drawPlayer();
    requestAnimationFrame(update);
}

// действие
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

// действие
function startGame() {
    arena = createMatrix(12, 20);
    player = playerReset(arena, player);
    updateScore(0);
}
