const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function forEachArrayElement (array, callback, startIndex = 0, fromFirst = true) {
    eachDo(array, function (i) {
        eachDo(array[i], function (j) {
            callback(i, j);
        }, startIndex, fromFirst);
    }, startIndex, fromFirst);
}

function eachDo(iteration, callback, startIndex = 0, fromFirst = true) {
    for(let i = startIndex; i < (Array.isArray(iteration) ? iteration.length : iteration); fromFirst ? i++ : ++i) {
        callback(i);
    }
}

function IF(condition, callback1, callback2 = function () {}) {
    if (condition) {
        callback1();
    } else {
        callback2();
    }
}

function ifCollide (callback) {
    IF(collide(arena, player), function () {
        callback();
    })
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function isRowFilled(rowArray) {
    return rowArray.slice(1, rowArray.length).every((el) => el !==  0)
}

function getFilledRowsNumbers(array) {
    let result = [];
    eachDo(array, function(y) {
        IF(isRowFilled(array[y]), function () {
            result.push(y);
        });
    });
    return result.reverse();
}
function deleteRowsNumbers(rowNumsArray) {
    let rowCount = 1;
    eachDo(rowNumsArray, function(i) {
        const row = arena.splice(rowNumsArray[i], 1)[0].fill(0);
        arena.unshift(row);

        player.score += rowCount * 10;
        rowCount += 2;
    });
} 

function arenaSweep() {
    let rowsToBeDeleted = getFilledRowsNumbers(arena);
    deleteRowsNumbers(rowsToBeDeleted);
}

function collide(arena, player) {
    const matrix = player.matrix;
    const playerPos = player.pos;
    let result = false;
    forEachArrayElement(matrix, function (y, x) {
        IF(matrix[y][x] !== 0 && (arena[y + playerPos.y] && arena[y + playerPos.y][x + playerPos.x]) !== 0, function () {
            result = true;
        });
    }, 0, false);
    return result;
}

function createMatrix(w, h) {
    const matrix = [];
    eachDo(h, function () {
        matrix.push(new Array(w).fill(0));
    })
    return matrix;
}

function drawMatrix(matrix, offset) {
    forEachArrayElement(matrix, function (row, col) {
        var value = matrix[row][col];
        IF(value !== 0, function () {
            context.fillStyle = colors[value];
            context.fillRect(col + offset.x, row + offset.y, 1, 1);
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    forEachArrayElement(player.matrix, function(y, x) {
        var value = player.matrix[y][x];
        IF (value !== 0, function () {
            arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function rotate(matrix, dir) {
    eachDo(matrix, function(y) {
        eachDo(y, function(x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }, 0, false);
    }, 0, false);

    IF(dir > 0, function () {
        eachDo(matrix, function (i) {
            matrix[i].reverse()
        });
    }, function () {
        matrix.reverse();
    });
}

function playerDrop() {
    player.pos.y++;
    ifCollide(function () {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    });
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    ifCollide(function () {
        player.pos.x -= offset;
    });
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    ifCollide(function() {
        arena = createMatrix(12, 20);
        player.score = 0;
        updateScore();
    });
} 

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        IF(offset > player.matrix[0].length, function () {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
        });
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    IF(dropCounter > dropInterval, function () {
        playerDrop();
    });

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    IF(event.keyCode === 37, function () {
        playerMove(-1);
    }, function () {
        IF(event.keyCode === 39, function () {
            playerMove(1);
        }, function () {
            IF(event.keyCode === 40, function () {
                playerDrop();
            }, function () {
                IF(event.keyCode === 81, function () {
                    playerRotate(-1);
                }, function () {
                    IF(event.keyCode === 87, function () {
                        playerRotate(1);
                    });
                });
            });
        });
    });
});

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

arena = createMatrix(12, 20);

player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();
