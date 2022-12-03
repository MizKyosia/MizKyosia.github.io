const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ended = false;
var currentMove = 0;
let originalPlate;
let last;
let direction;
let check = [false, false];
let draggedPiece;
let promotedPiece;
let PGN = [];
var result = '0-1';
var file = null;
var depth = 1;
document.addEventListener("DOMContentLoaded", function (event) {
    var search = new URLSearchParams(window.location.search)
    if (!isNaN(parseInt(search.get('depth')))) depth = parseInt(search.get('depth'))
    console.log(depth)
    originalPlate = document.getElementById('plate').innerHTML;
    this.addEventListener('keydown', function (e) {
        if (e.key == "Escape") {
            if (document.getElementById('pause').classList.contains('appear')) document.getElementById('pause').classList.remove('appear')
            else if (!document.getElementById('pause').classList.contains('appear') && !document.getElementById('choice').classList.contains('appear')) document.getElementById('pause').classList.add('appear')
            else if (document.getElementById('help').style.display == "flex") document.getElementById('return').click();
        }
    });
    for (const c of document.querySelectorAll('.choices')) c.addEventListener('click', choose);
    loadPage();
});
function download() {
    const date = new Date();
    var content = `[Event "Casual game"]\n[Site "Website (mizkyosia.github.io/Chess)"]\n[Date "${date.getFullYear()}.${date.getMonth()}.${date.getDate()}"]\n[Result "${result}"]\n\n`;
    var line = '';
    for (let i = 0; i < PGN.length; i += 2) {
        ;
        //console.log(`${i / 2 + 1}.${PGN[i]} ${PGN[i + 1]}`);
        line += `${i / 2 + 1}.${PGN[i]} ${PGN[i + 1] ? PGN[i + 1] + ' ' : ''}`;
        if (line.length > 100) {
            content += line + '\n';
            line = '';
        }
    }
    content += line + result;
    var data = new Blob([content], { type: '.pgn' });

    // // If we are replacing a previously generated file we need to
    // // manually revoke the object URL to avoid memory leaks.
    if (file !== null) {
        window.URL.revokeObjectURL(file);
    }
    file = window.URL.createObjectURL(data);
    document.getElementById('pgn').href = file;
    document.getElementById('pgn').download = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()} ${date.getHours()}h${date.getMinutes()}.pgn`
    document.getElementById('download').setAttribute('onclick', "document.getElementById('pgn').click()")
    document.getElementById('pgn').click()
}

function loadPage() {
    document.getElementById('plate').innerHTML = originalPlate;
    currentMove = 0;
    last = null;
    ended = false;
    draggedPiece = null;
    PGN = [];
    last = null;
    document.querySelectorAll('.black_piece').forEach(e => {
        e.draggable = false;
        e.classList.add('no-drag')
    });
    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("dragenter", dragenter);
        cell.addEventListener("dragleave", dragleave);
        cell.addEventListener("dragover", dragover);
        cell.addEventListener("drop", drop);
        cell.addEventListener('click', clickCell);
    });
    document.querySelectorAll(".piece").forEach(piece => {
        piece.addEventListener("dragstart", dragstart);
        piece.addEventListener("dragend", dragend);
        piece.addEventListener("dragover", dragover);
        piece.addEventListener('click', clickPiece);
        var x = parseInt(piece.parentElement.id.split(',')[0]) - 1
        var y = parseInt(piece.parentElement.id.split(',')[1]) - 1
        grid.grid[y][x] = { type: (piece.classList[0] == 'Knight' ? 'N' : piece.classList[0][0]), color: piece.classList[2] == 'white_piece', moved: false }
        if (piece.classList[0] == 'King') grid.grid[y][x].checked = false;
    });
    document.getElementById('announcement').innerHTML = 'Au tour du joueur <span id="player">blanc</span> !'
    document.getElementById('pause').classList.remove('appear')
    document.getElementById('download').setAttribute('style', 'display:none;')
    document.getElementById('pgn').setAttribute('download', '')
    console.log(grid)
};
function dragstart(e) {
    this.classList.add('translated');
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    move(this)
};
function dragend(e) {
    this.classList.remove('translated');
    unlightPlate();
    return false;
};
function dragleave(e) {
    this.classList.remove('over');
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
};
function dragenter(e) {
    if (this.classList.contains('highlight')) this.classList.add("over");
    if (!this.classList.contains('highlight')) {
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
    };
};
function dragover(e) {
    if (e.preventDefault) e.preventDefault();
    return false;
};
function drop(e) {
    e.stopPropagation();
    dropCell(this, false);
};
function dropCell(cell, force) {
    check = [false, false]
    var ended = false;
    var move = '';
    var taken = false;
    var column = true;
    var row = true;
    var only = true;
    var enPassant = false;
    if ((!cell.classList.contains('highlight') || cell.classList.contains('not-allowed')) && !force) return false;
    if (!cell.firstElementChild || draggedPiece.id != cell.firstElementChild.id) {
        const m = { last: draggedPiece.parentElement.id.split(',').map(t => parseInt(t) - 1), new: cell.id.split(',').map(t => parseInt(t) - 1) }
        console.log(m)
        if (cell.classList.contains('castle')) {
            let rook, king;
            if (cell.firstElementChild.classList[0] == 'Rook') {
                rook = cell.firstElementChild;
                king = draggedPiece;
                last = 'castle';
            } else {
                rook = draggedPiece;
                king = cell.firstElementChild;
            }
            king.classList.add('moved')
            move = rook.id.split(',')[0] == '1' ? 'O-O-O' : 'O-O';
            m.last = move
            m.new = move
            document.getElementById(`${direction ? '7' : '2'},${king.classList[2] == 'white_piece' ? '1' : '8'}`).append(king);
            document.getElementById(`${direction ? '6' : '3'},${king.classList[2] == 'white_piece' ? '1' : '8'}`).append(rook);
        } else {
            if (draggedPiece.classList[0] != 'Pawn') move += (draggedPiece.classList[0] == 'Knight' ? 'N' : draggedPiece.classList[0][0]);
            document.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                if (p.id == draggedPiece.id) return;
                let test = true;
                validCellsGame(p).forEach(c => { test = c.id != cell.id; console.log(c.id, cell.id) });
                only &&= test;
            })
            if (!only) {
                draggedPiece.parentElement.parentElement.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                    if (p.id == draggedPiece.id) return;
                    var test = true;
                    validCellsGame(p).forEach(c => test = c.id != cell.id);
                    row &&= test;
                })
                if (!row) {
                    document.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                        if (p.id == draggedPiece.id || p.parentElement.id.split(',')[0] != draggedPiece.parentElement.id.split(',')[0]) return;
                        var test = true;
                        validCellsGame(p).forEach(c => test = c.id != cell.id);
                        column &&= test;
                    })
                    if (column && row) move += `${alphabet[parseInt(cell.id.split(',')[0]) - 1]}${cell.id.split(',')[1]}`
                    else if (column) move += `${alphabet[parseInt(cell.id.split(',')[0]) - 1]}`
                } else {
                    move += `${cell.id.split(',')[0]}`
                }
            }
            if (cell.firstElementChild && cell.firstElementChild.classList[2] !== draggedPiece.classList[2]) {
                taken = true;
                cell.innerHTML = "";
            };
            if (cell.classList.contains('ep')) {
                cell.classList.remove('highlight', 'ep');
                document.getElementById(`${cell.id.split(',')[0]},${parseInt(cell.id.split(',')[1]) + (draggedPiece.classList[2] == 'white_piece' ? -1 : 1)}`).firstElementChild.remove();
                cell.appendChild(draggedPiece);
                enPassant = true;
            } else {
                document.querySelectorAll('.choices').forEach(e => e.src = `../Images/${e.id.toLowerCase()}_${draggedPiece.classList[2] == 'white_piece' ? 'white' : 'black'}.png`);
                draggedPiece.classList.remove('translated');
                if (!draggedPiece.classList.contains('moved')) draggedPiece.classList.add('moved');
                cell.appendChild(draggedPiece);
                if (cell.id.split(',')[1] == (cell.firstElementChild.classList[2] == 'black_piece' ? 1 : 8) && cell.firstElementChild.classList[0] == "Pawn") {
                    document.getElementById('choice').classList.add('appear');
                    promotedPiece = cell.firstElementChild;
                };
            }
            move += `${taken ? 'x' : ''}${alphabet[parseInt(cell.id.split(',')[0]) - 1]}${cell.id.split(',')[1]}`
            console.log(move)
        }
        document.querySelectorAll('.no-drag').forEach(e => {
            e.draggable = true;
            e.classList.remove('no-drag');
        });
        document.querySelectorAll(`.${draggedPiece.classList[2]}`).forEach(e => {
            e.draggable = false;
            e.classList.add('no-drag');
        });
        document.querySelectorAll(`.${draggedPiece.classList[2] == 'white_piece' ? 'black' : 'white'}_piece`).forEach(e => {
            for (const c of validCellsGame(e)) {
                if (!c.firstElementChild) continue;
                if (c.firstElementChild.id == `${draggedPiece.classList[2] == 'white_piece' ? 'white' : 'black'}_king`) ended = true;
            };
        });
        document.querySelectorAll('.not-allowed').forEach(e => e.classList.remove('not-allowed'))
        document.querySelectorAll('.' + draggedPiece.classList[2]).forEach(e => {
            for (const c of validCellsGame(e)) {
                if (!c.firstElementChild) continue;
                if (c.firstElementChild.id == `${draggedPiece.classList[2] == 'white_piece' ? 'black' : 'white'}_king` && !ended) {
                    check[currentMove == 0 ? 1 : 0] = true
                    c.firstElementChild.classList.add('checked', 'not-allowed')
                }
            };
        });
        draggedPiece = null;
        if (ended) endgame();
        cell.classList.remove('over');
        if (enPassant) move += ' e.p'
        PGN.push(move)
        grid.move(m)
        currentMove == 0 ? turn() : currentMove = 0
    };
    return true;
};

function endgame() {
    if (ended) return;
    ended = true;
    result = currentMove == 0 ? '0-1' : '1-0'
    for (const p of document.querySelectorAll('.piece')) {
        p.draggable = false;
        p.classList.add('no-drag');
    };
    document.getElementById('announcement').innerHTML = `Le joueur ${currentMove == 1 ? 'blanc' : 'noir'} a gagné !`;
    document.getElementById('download').setAttribute('style','')
    alert("Partie terminée !");
};
function choose(e) {
    document.getElementById('choice').classList.remove('appear');
    promotedPiece.classList.replace('Pawn', this.id);
    promotedPiece.src = promotedPiece.src.replace('pawn', this.id.toLowerCase());
    var c = promotedPiece.parentElement.id.split(',').map(e => parseInt(e) - 1)
    PGN[PGN.length - 1] += '=' + (this.id == 'Knight' ? 'N' : this.id[0])
};
function unlightPlate() {
    for (const cell of document.querySelectorAll(".highlight")) {
        cell.classList.remove('highlight', 'castle', 'ep');
    };
    for (const cell of document.querySelectorAll(".over")) {
        cell.classList.remove('over');
    };
};
function clickCell(e) {
    if (!draggedPiece || this.firstElementChild?.id == draggedPiece.id) return;
    dropCell(this, false);
    unlightPlate();
    draggedPiece = null;
    return false;
};
function clickPiece(e) {
    if (this.classList.contains('no-drag') || this.parentElement.classList.contains('highlight')) return false;
    move(this)
    return false;
};
function move(p) {
    const x = parseInt(p.parentElement.id.split(',')[0]);
    const y = parseInt(p.parentElement.id.split(',')[1]);
    draggedPiece = p;
    unlightPlate();
    if (check[currentMove]) {
        //if (p.classList[0] != 'King') return;
        const cells = validCellsGame(p)
        document.querySelectorAll(`.${currentMove == 0 ? 'black' : 'white'}_piece`).forEach(p2 => {
            cells.forEach(c => {
                if (!isIn(c, validCellsGame(p2))) c.classList.add('highlight');
            });
        })
        return
    }
    validCellsGame(p).forEach(c => c.classList.add('highlight'));
    if (p.classList[0] == 'Pawn' && y == (p.classList[2] == 'white_piece' ? 5 : 4)) {
        if (last == `${x + 1},${y + (p.classList[2] == 'white_piece' ? 2 : -2)}` && document.getElementById(`${x + 1},${y}`)?.childElementCount > 0) document.getElementById(`${x + 1},${y + (p.classList[2] == 'white_piece' ? 1 : -1)}`).classList.add('highlight', 'ep');
        if (last == `${x - 1},${y + (p.classList[2] == 'white_piece' ? 2 : -2)}` && document.getElementById(`${x - 1},${y}`)?.childElementCount > 0) document.getElementById(`${x - 1},${y + (p.classList[2] == 'white_piece' ? 1 : -1)}`).classList.add('highlight', 'ep');
    } else if (!p.classList.contains('moved')) {
        if (p.classList[0] == 'King' && !p.classList.contains('checked')) document.querySelectorAll(`.Rook.${p.classList[2]}`).forEach(c => {
            if (!c.classList.contains('moved') && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) {
                c.parentElement.classList.add('highlight', 'castle');
                direction = c.parentElement.id.split(',')[0] == '8';
            }
        })
        else if (p.classList[0] == 'Rook' && !document.querySelector(`.King.${p.classList[2]}`).classList.contains('checked')) {
            if (!p.classList.contains('moved') && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) document.querySelector(`.King.${p.classList[2]}`).parentElement.classList.add('highlight', 'castle')
            direction = p.parentElement.id.split(',')[0] == '8'
        }
    }
    last = p.parentElement.id
}
function letter(l) {
    let x = 1;
    for (e of alphabet) {
        if (l === e) return x;
        x++;
    };
};
function validCellsGame(piece) {
    const x = parseInt(piece.parentElement.id.split(',')[0]);
    const y = parseInt(piece.parentElement.id.split(',')[1]);
    const type = piece.classList[0];
    const color = piece.classList[2];
    let valid_cells = [];
    if (type == 'King') {
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
        for (const [a, b] of coord) {
            let e = document.getElementById(`${a + x},${b + y}`);
            if (e && e?.firstElementChild?.classList[2] != color) valid_cells.push(e);
        };
    } else if (type == 'Queen') {
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
        for (const [a, b] of coord) {
            for (var i = 1;
                i < 9;
                i++) {
                let e = document.getElementById(`${i * a + x},${i * b + y}`);
                if (!e) break
                else if (e && e.childElementCount == 0) valid_cells.push(e)
                else if (e?.firstElementChild.classList[2] != color) {
                    valid_cells.push(e);
                    break;
                }
                else break;
            };
        };
    } else if (type == 'Rook') {
        const coord = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        for (const [a, b] of coord) {
            for (var i = 1;
                i < 9;
                i++) {
                let e = document.getElementById(`${i * a + x},${i * b + y}`);
                if (!e) break
                else if (e && e.childElementCount == 0) valid_cells.push(e)
                else if (e?.firstElementChild.classList[2] != color) {
                    valid_cells.push(e);
                    break;
                }
                else break;
            };
        };
    } else if (type == 'Bishop') {
        const coord = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (const [a, b] of coord) {
            for (var i = 1;
                i < 9;
                i++) {
                let e = document.getElementById(`${i * a + x},${i * b + y}`);
                if (!e) break
                else if (e && e.childElementCount == 0) valid_cells.push(e)
                else if (e?.firstElementChild.classList[2] != color) {
                    valid_cells.push(e);
                    break;
                }
                else break;
            };
        };
    } else if (type == 'Knight') {
        let z = [`${x + 2},${y + 1}`, `${x + 1},${y + 2}`, `${x + 2},${y - 1}`, `${x - 2},${y + 1}`, `${x + 1},${y - 2}`, `${x - 1},${y + 2}`, `${x - 2},${y - 1}`, `${x - 1},${y - 2}`];
        for (a of z) {
            let e = document.getElementById(a);
            if (!e) {
                continue
            }
            else if (e.firstElementChild && e.firstElementChild.classList[2] == color) {
                continue
            }
            else valid_cells.push(e);
        };
    } else {
        let e = document.getElementById(`${x},${y + (color == 'white_piece' ? 1 : -1)}`);
        if (e && !e.firstElementChild) valid_cells.push(e);
        if (document.getElementById(`${x + 1},${y + (color == 'white_piece' ? 1 : -1)}`)?.firstElementChild?.classList.contains(color == 'white_piece' ? 'black_piece' : 'white_piece')) valid_cells.push(document.getElementById(`${x + 1},${y + (color == 'white_piece' ? 1 : -1)}`));
        if (document.getElementById(`${x - 1},${y + (color == 'white_piece' ? 1 : -1)}`)?.firstElementChild?.classList.contains(color == 'white_piece' ? 'black_piece' : 'white_piece')) valid_cells.push(document.getElementById(`${x - 1},${y + (color == 'white_piece' ? 1 : -1)}`));
        if (y == (color == 'white_piece' ? 2 : 7) && document.getElementById(`${x},${y + (color == 'white_piece' ? 2 : -2)}`).childElementCount == 0 && e.childElementCount == 0) valid_cells.push(document.getElementById(`${x},${y + (color == 'white_piece' ? 2 : -2)}`));
    };
    return valid_cells;
};
function isIn(a, b) {
    for (c of b) {
        if (a == c) return true;
    } return false;
};

/* Time for the opponent in solo player, a.k.a the ✨bot✨*/

function reverseArray(a) {
    return a.slice().reverse()
}

const whitePawnEval = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
    [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

const blackPawnEval = reverseArray(whitePawnEval);

const whiteKnightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const blackKnightEval = reverseArray(whiteKnightEval)

const whiteBishopEval = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const blackBishopEval = reverseArray(whiteBishopEval);

const whiteRookEval = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
];

const blackRookEval = reverseArray(whiteRookEval);

const whiteQueenEval = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const blackQueenEval = reverseArray(whiteQueenEval)

const whiteKingEval = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
    [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
];

const values = {
    'King': 900,
    'Queen': 90,
    'Knight': 30,
    'Bishop': 30,
    'Rook': 50,
    'Pawn': 10
}

const blackKingEval = reverseArray(whiteKingEval);

function getValue(piece) {
    if (!piece) return
    const x = parseInt(piece.parentElement.id.split(',')[0])
    const y = parseInt(piece.parentElement.id.split(',')[1])
    return (eval(`${piece.classList[2].split('_')[0]}${piece.classList[0]}Eval[${y - 1}][${x - 1}]`) + values[piece.classList[0]]) * (piece.classList[2] == 'white_piece' ? 1 : -1)
}

function evaluateBoard() {
    var eval = 0;
    document.querySelectorAll('.piece').forEach(p => eval += getValue(p));
    grid.toString()
    console.log('eval : ',eval,grid.grid)
    return eval;
}

function turn() {
    currentMove = 1
    unlightPlate()
    document.getElementById('announcement').innerHTML = 'Évaluation du plateau de jeu...'
    evaluateBoard()
    document.querySelectorAll('.black_piece').forEach(p => p.classList.add('no-drag'))
    setTimeout(() => {
        document.getElementById('announcement').innerHTML = 'Choix du prochain coup...'
        minimaxRoot(depth, false).then(e => {
            console.log('move : ', e)
            grid.toString()
            document.getElementById('announcement').innerHTML = 'Au tour du joueur blanc !'
            document.querySelectorAll('.black_piece').forEach(p => p.classList.remove('no-drag'))
            document.getElementById(`${e.last[0] + 1},${e.last[1] + 1}`).firstElementChild.click()
            document.getElementById(`${e.new[0] + 1},${e.new[1] + 1}`).click()
        })
    }, 400)
}

function minimaxRoot(depth, isMaximisingPlayer) {
    return new Promise(resolve => {
        var newGameMoves = grid.getMoves(isMaximisingPlayer);
        var bestMove = -9999;
        var bestMoveFound;

        for (var i = 0; i < newGameMoves.length; i++) {
            var newGameMove = newGameMoves[i]
            grid.move(newGameMove)
            var value = minimax(depth - 1, -10000, 10000, !isMaximisingPlayer);
            grid.undo()
            if (value >= bestMove) {
                bestMove = value;
                bestMoveFound = newGameMove;
            }
            console.log('root : ',bestMove, bestMoveFound,'\n',value,newGameMove)
        }
        resolve(bestMoveFound);
    })
};

function minimax(depth, alpha, beta, isMaximisingPlayer) {
    /*positionCount++;*/
    if (depth <= 0) {
        return -evaluateBoard();
    }

    var newGameMoves = grid.getMoves();

    if (!isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            grid.move(newGameMoves[i])
            bestMove = Math.max(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
            grid.undo();
            alpha = Math.max(alpha, bestMove);
            console.log('bestMove : ', bestMove)
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            grid.move(newGameMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
            grid.undo();
            beta = Math.min(beta, bestMove);
            console.log('bestMove : ', bestMove)
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

class Grid {
    constructor() {
        return this
    }

    grid = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]
    ]

    lastMoves = []

    getMoves(player) {
        let moves = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const p = this.grid[y][x];
                if (!p || p.color != player) continue;
                const z = this.pieceMove(x, y);
                moves = moves.concat(z);
            }
        }
        return moves;
    }

    pieceMove(x, y) {
        const p = this.grid[y][x]
        const moves = []
        if (p.type == 'K') {
            const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
            for (const [a, b] of coord) {
                if (b + y < 0 || b + y > 7 || a + x < 0 || a + x > 7) continue;
                else if (!this.grid[b + y][a + x] || this.grid[b + y][a + x].color != p.color) moves.push({ last: [x, y], new: [a + x, b + y] });
            };
        } else if (p.type == 'Q') {
            const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
            for (const [a, b] of coord) {
                for (var i = 1;
                    i < 9;
                    i++) {
                    if (b * i + y < 0 || b * i + y > 7 || a * i + x < 0 || a * i + x > 7) continue;
                    else if (!this.grid[b * i + y][a * i + x]) moves.push({ last: [x, y], new: [a * i + x, b * i + y] });
                    else if (this.grid[b * i + y][a * i + x].color != p.color) { moves.push({ last: [x, y], new: [a * i + x, b * i + y] }); break; }
                    else break;
                };
            };
        } else if (p.type == 'R') {
            const coord = [[0, -1], [-1, 0], [0, 1], [1, 0]];
            for (const [a, b] of coord) {
                for (var i = 1;
                    i < 8;
                    i++) {
                    if (b * i + y < 0 || b * i + y > 7 || a * i + x < 0 || a * i + x > 7) continue;
                    else if (!this.grid[b * i + y][a * i + x]) moves.push({ last: [x, y], new: [a * i + x, b * i + y] });
                    else if (this.grid[b * i + y][a * i + x].color != p.color) { moves.push({ last: [x, y], new: [a * i + x, b * i + y] }); break; }
                    else break;
                };
            };
        } else if (p.type == 'B') {
            const coord = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
            for (const [a, b] of coord) {
                for (var i = 1;
                    i < 9;
                    i++) {
                    if (b * i + y < 0 || b * i + y > 7 || a * i + x < 0 || a * i + x > 7) continue;
                    else if (!this.grid[b * i + y][a * i + x]) moves.push({ last: [x, y], new: [a * i + x, b * i + y] });
                    else if (this.grid[b * i + y][a * i + x].color != p.color) { moves.push({ last: [x, y], new: [a * i + x, b * i + y] }); break; }
                    else break;
                };
            };
        } else if (p.type == 'N') {
            [{ last: [x, y], new: [x + 2, y + 1] }, { last: [x, y], new: [x + 1, y + 2] }, { last: [x, y], new: [x + 2, y - 1] }, { last: [x, y], new: [x - 2, y + 1] }, { last: [x, y], new: [x + 1, y - 2] }, { last: [x, y], new: [x - 1, y + 2] }, { last: [x, y], new: [x - 2, y - 1] }, { last: [x, y], new: [x - 1, y - 2] }].forEach(m => { if (!(m.new[0] > 7 || m.new[0] < 0 || m.new[1] > 7 || m.new[1] < 0) && this.grid[m.new[1]][m.new[0]]?.color !== p.color) moves.push(m) });
        } else {
            if (!this.grid[y + (p.color ? 1 : - 1)][x]) moves.push({ last: [x, y], new: [x, y + (p.color ? 1 : -1)] });
            if (this.grid[y + (p.color ? 1 : -1)][x + 1] && this.grid[y + (p.color ? 1 : -1)][x + 1].color != p.color) moves.push({ last: [x, y], new: [x + 1, y + (p.color ? 1 : -1)] });
            if (this.grid[y + (p.color ? 1 : -1)][x - 1] && this.grid[y + (p.color ? 1 : -1)][x - 1].color != p.color) moves.push({ last: [x, y], new: [x - 1, y + (p.color ? 1 : -1)] });
            //if (lastMoves[lastMoves.length - 1]?.lastId == `${x - 1},${y + (color ? 2 : -2)}` && document.getElementById(`${x - 1},${y}`)) valid_cells.push(`${x - 1},${y + (color ? 1 : -1)}`);
            if (!p.moved && y + (p.color ? 2 : -2) >= 0 && y + (p.color ? 2 : -2) <= 7 && !this.grid[y + (p.color ? 2 : -2)][x]) moves.push({ last: [x, y], new: [x, y + (p.color ? 2 : -2)] })
        };
        return moves;
    }

    move(m) {
        this.lastMoves.push(m)
        const p = this.grid[m.last[1]][m.last[0]]
        if (this.grid[m.new[1]][m.new[0]]) {
            m.taken = {}
            Object.assign(m.taken, this.grid[m.new[1]][m.new[0]])
        }
        m.p = {}
        Object.assign(m.p, p)
        p.moved = true
        this.grid[m.new[1]][m.new[0]] = p
        this.grid[m.last[1]][m.last[0]] = null
        return this
    }

    undo() {
        const m = this.lastMoves.pop()
        this.grid[m.last[1]][m.last[0]] = m.p
        this.grid[m.new[1]][m.new[0]] = (m.taken ? m.taken : null)
        return this
    }

    toString() {
        var output = '  0 1 2 3 4 5 6 7';
        for (let y = 7; y > -1; y--) {
            output += `\n${7 - y} `
            for (let x = 0; x < this.grid[0].length; x++) {
                var p = this.grid[y][x]
                output += (p ? p.type : ' ') + ' '
            }
        }
        console.log(output)
    }
};
const grid = new Grid();