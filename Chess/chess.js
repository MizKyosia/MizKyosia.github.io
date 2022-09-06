const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ended = false;
var currentMove = 0;
var currentPlayer = -1;
const moves = new Map();
const lastMoves = new Map();
let selectedPiece;
let originalPlate;
let last;
document.addEventListener("DOMContentLoaded", function (event) {
    originalPlate = document.getElementById('plate').innerHTML;
    this.addEventListener('keydown', function (e) {
        if (e.key == "Escape") {
            if (document.getElementById('pause').classList.contains('appear')) document.getElementById('pause').classList.remove('appear')
            else if (!document.getElementById('pause').classList.contains('appear') && !document.getElementById('choice').classList.contains('appear')) document.getElementById('pause').classList.add('appear')
            else if (document.getElementById('help').style.display == "flex") document.getElementById('return').click();
        };
    });
    document.querySelectorAll('.black_piece').forEach(e => {
        e.draggable = false;
        e.classList.add('no-drag')
    });
    document.getElementById('file').onchange = load;
    let cells = document.querySelectorAll(".cell");
    for (const cell of cells) {
        cell.addEventListener("dragenter", dragenter);
        cell.addEventListener("dragleave", dragleave);
        cell.addEventListener("dragover", dragover);
        cell.addEventListener("drop", drop);
        cell.addEventListener('click', clickCell);
    };
    const pieces = document.querySelectorAll(".piece");
    for (const piece of pieces) {
        piece.addEventListener("dragstart", dragstart);
        piece.addEventListener("dragend", dragend);
        piece.addEventListener("dragover", dragover);
        piece.addEventListener('click', clickPiece);
    };
    for (const c of document.querySelectorAll('.cell')) {
    };
    for (const c of document.querySelectorAll('.choices')) c.addEventListener('click', choose);
});
let draggedPiece;
let promotedPiece;
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
    dropCell(this);
};
function dropCell(cell) {
    var ended = false;
    if (!cell.classList.contains('highlight')) return false;
    if (cell.firstElementChild && cell.firstElementChild.classList[2] !== draggedPiece.classList[2]) cell.innerHTML = "";
    if (!cell.firstElementChild || draggedPiece.id != cell.firstElementChild.id) {
        if (cell.classList.contains('castle')) {
            let rook,king;
            if(cell.firstElementChild.classList[0] == 'Rook'){
                rook = cell.firstElementChild
                king = draggedPiece = 'castle'
            }
        } else if(cell.classList.contains('ep')) {
            cell.classList.remove('highlight','ep')
            document.getElementById(`${cell.id.split(',')[0]},${parseInt(cell.id.split(',')[1]) + (draggedPiece.classList[2] == 'white_piece' ? -1 : 1)}`).firstElementChild.remove()
            cell.appendChild(draggedPiece)
        } else{
            document.querySelectorAll('.choices').forEach(e => e.src = `./Images/${e.id.toLowerCase()}_${draggedPiece.classList[2] == 'white_piece' ? 'white' : 'black'}.png`);
            draggedPiece.classList.remove('translated');
            if (!draggedPiece.classList.contains('moved')) draggedPiece.classList.add('moved')
            cell.appendChild(draggedPiece);
            if (cell.id.split(',')[1] == (cell.firstElementChild.classList[2] == 'black_piece' ? 1 : 8) && cell.firstElementChild.classList[0] == "Pawn") {
                document.getElementById('choice').classList.add('appear');
                promotedPiece = cell.firstElementChild;
            };
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
                if (c.firstElementChild.id.replace(/_[0-9]{1,}/, '') == `${draggedPiece.classList[2] == 'white_piece' ? 'white' : 'black'}_king`) ended = true;
            };
        });
        document.getElementById('player').innerHTML = draggedPiece.classList[2] == 'white_piece' ? 'noir' : 'blanc';
        draggedPiece = null;
        if (ended) endgame();
    };
    cell.classList.remove('over');
    currentPlayer == 0 ? currentPlayer = 1 : currentPlayer = 0;
    return true;
};
function endgame() {
    if (ended) return;
    ended = true;
    for (const p of document.querySelectorAll('.piece')) {
        p.draggable = false;
        p.classList.add('no-drag');
    };
    document.getElementById('announcement').innerHTML = `Le joueur <span id="player">${document.getElementById("player").innerHTML}</span> a gagné !`;
    alert("Partie terminée !");
};
function load() {
    currentMove = 0;
    currentPlayer = -1;
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        const lines = this.result.replace(/\{.{0,}\}/g, '').replace(/;.*/g, '').replace(/ {2,}/, ' ').split('\n');
        document.getElementById('announcement').innerHTML = "Reconstitution d'un match";
        var oldLine = lines[0];
        let add = '';
        while (oldLine.startsWith('[')) {
            if (document.getElementById(oldLine.split(' "')[0].replace('[', '').toLowerCase())) document.getElementById(oldLine.split(' "')[0].replace('[', '').toLowerCase()).innerHTML = oldLine.split(' "')[0].replace('[', '') + ' : ' + oldLine.split(' "')[1].replace('"]', '')
            else add += `<h3 id="${oldLine.split(' "')[0].replace('[', '').toLowerCase()}">${oldLine.split(' "')[0].replace('[', '')} : ${oldLine.split(' "')[1].replace('"]', '')}</h3>`;
            lines.shift();
            oldLine = lines[0];
        };
        document.getElementById('announcement').outerHTML += add;
        let m = lines.join(' ').replace(/\r/g, "").split(/[0-9]{1,}\./g).map(e => {
            while (e.endsWith(' ')) { e = e.slice(0, e.length - 1) };
            while (e.startsWith(' ')) { e = e.slice(1) };
            return e.split(' ');
        });
        while (m[0] == '') m.shift();
        for (let i = 0;
            i < m.length;
            i++) {
            let z = m[i];
            while (z[-1] == ' ') z.pop();
            for (let x = 0;
                x < z.length;
                x++) {
                if (x === 2) moves.set(`${i - 1}-2`, z[x]);
                moves.set(`${i}-${x}`, z[x]);
            };
        };
        if (m.length > 0) document.getElementById('right_arrow').classList.add('allowed');
        setPlate();
    };
    reader.readAsText(file);
};
function choose(e) {
    document.getElementById('choice').classList.remove('appear');
    promotedPiece.classList.replace('Pawn', this.id);
    promotedPiece.src = promotedPiece.src.replace('pawn', this.id.toLowerCase());
};
function unlightPlate() {
    for (const cell of document.querySelectorAll(".highlight")) {
        cell.classList.remove('highlight', 'castle');
    };
    for (const cell of document.querySelectorAll(".over")) {
        cell.classList.remove('over');
    };
};
function clickCell(e) {
    if (!draggedPiece || this.firstElementChild?.id == draggedPiece.id) return;
    if (this.classList.contains('highlight')) {
        draggedPiece.parentElement.innerHTML = null;
        dropCell(this);
    };
    unlightPlate();
    draggedPiece = null;
    return false;
};
function clickPiece(e) {
    if (this.classList.contains('no-drag') || this.parentElement.classList.contains('highlight')) return false;
    move(this)
    return false;
};
function move(p){
    const x = parseInt(p.parentElement.id.split(',')[0])
    const y = parseInt(p.parentElement.id.split(',')[1])
    unlightPlate()
    draggedPiece = p;
    validCellsGame(p).forEach(c => c.classList.add('highlight'));
    if (p.classList[0] == 'Pawn' && y == (p.classList[2] == 'white_piece' ? 5 : 4)){
        if(last == `${x+1},${y+(p.classList[2] == 'white_piece' ? 2 : -2)}` && document.getElementById(`${x+1},${y}`)?.childElementCount > 0) document.getElementById(`${x+1},${y+1}`).classList.add('highlight','ep')
        if(last == `${x-1},${y+(p.classList[2] == 'white_piece' ? 2 : -2)}` && document.getElementById(`${x-1},${y}`)?.childElementCount > 0) document.getElementById(`${x-1},${y+(p.classList[2] == 'white_piece' ? 1 : -1)}`).classList.add('highlight','ep')
    } else if (!p.classList.contains('moved')) {
        if (p.classList[0] == 'King') document.querySelectorAll(`.Rook.${p.classList[2]}`).forEach(c => {
            if (!c.classList.contains('moved') && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) c.parentElement.classList.add('highlight', 'castle')
        })
        else if (p.classList[0] == 'Rook') {
            if (!p.classList.contains('moved') && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) document.querySelector(`.King.${p.classList[2]}`).parentElement.classList.add('highlight', 'castle')
        }
    }
    last = p.parentElement.id
}
function setPlate() {
    document.getElementById('plate').innerHTML = originalPlate;
    document.querySelectorAll('.piece').forEach(e => {
        e.draggable = false;
        e.classList.add('no-drag')
    });
    for (const p of document.querySelectorAll('.piece')) {
        if (p.parentElement.id != 'plate') {
            p.setAttribute('style', `transform:translate(${parseInt(p.parentElement.id.split(',')[0] * 80 - 80)}px,${640 - (parseInt(p.parentElement.id.split(',')[1]) * 80)}px);
`);
            p.id = p.parentElement.id;
            p.parentElement.id = 'null';
        } else {
            p.setAttribute('style', `transform:translate(${parseInt(p.id.split(',')[0]) * 80 - 80}px,${640 - (parseInt(p.id.split(',')[1]) * 80)}px);
`);
        };
        document.getElementById('plate').appendChild(p).classList.add('simulation');
    };
    for (const c of document.querySelectorAll('.cell')) {
        c.id = 'null';
    };
};
function back(c) {
    if (!c.contains('allowed') && c != null) return;
    document.getElementById('right_arrow').classList.add('allowed');
    let m = lastMoves.get(`${currentMove}-${currentPlayer}`);
    lastMoves.delete(`${currentMove}-${currentPlayer}`);
    if (currentMove === 0 && currentPlayer === 0) {
        currentPlayer--;
        document.getElementById('left_arrow').classList.remove('allowed');
        setPlate();
        return;
    };
    if (currentMove >= 0 && currentPlayer == 1) currentPlayer--
    else if (currentMove >= 0 && currentPlayer == 0) {
        currentMove--;
        currentPlayer = 1
    };
    if (currentMove == 0 && currentPlayer == -1) document.getElementById('left_arrow').classList.remove('allowed');
    if (currentMove < moves.length - 1 || (currentMove == moves.length - 1 && currentPlayer == 0)) document.getElementById('right_arrow').classList.add('allowed');
    if (m.id === 'O-O-O') {
        var a = document.getElementById(`3,${currentPlayer == 1 ? '1' : '8'}`);
        var b = document.getElementById(`2,${currentPlayer == 1 ? '1' : '8'}`);
        a.setAttribute('style', `transform:translate(320px,${currentPlayer == 1 ? 560 : 0}px);
`);
        b.setAttribute('style', `transform:translate(0px,${currentPlayer == 1 ? 560 : 0}px);
`);
        a.id = `5,${a.id.split(',')[1]}`;
        b.id = `1,${b.id.split(',')[1]}`;
        return;
    } else if (m.id === 'O-O') {
        var a = document.getElementById(`7,${currentPlayer == 1 ? '1' : '8'}`);
        var b = document.getElementById(`6,${currentPlayer == 1 ? '1' : '8'}`);
        a.setAttribute('style', `transform:translate(320px,${currentPlayer == 1 ? 560 : 0}px);
`);
        b.setAttribute('style', `transform:translate(560px,${currentPlayer == 1 ? 560 : 0}px);
`);
        a.id = `5,${a.id.split(',')[1]}`;
        b.id = `8,${b.id.split(',')[1]}`;
        return;
    };
    const p = document.getElementById(m.id);
    p.setAttribute('style', `transform:${m.position}`);
    p.id = m.lastId;
    if (m.taken !== '') document.getElementById('plate').innerHTML += m.taken;
};
function next(c) {
    if (!c.contains('allowed') && c != null) return;
    if (currentMove === 0 && currentPlayer === -1) {
        currentPlayer++;
        document.getElementById('left_arrow').classList.add('allowed');
    }
    else if (currentMove >= 0 && currentPlayer == 0) currentPlayer++
    else if (currentMove >= 0 && currentPlayer == 1) {
        currentMove++;
        currentPlayer = 0
    };
    if ((currentMove == Math.round(moves.size / 2) - 1 && currentPlayer % 2 == 1) || (currentMove == moves.length && currentPlayer == 0)) document.getElementById('right_arrow').classList.remove('allowed');
    if (currentMove > 0 || (currentMove == 0 && currentPlayer == 1)) document.getElementById('left_arrow').classList.add('allowed');
    let m = moves.get(`${currentMove}-${currentPlayer}`);
    let piece = 'Pawn';
    let oldColumn = 0;
    let oldLine = 0;
    var taken = false;
    let pastPiece = { lastId: '', position: '', id: '', taken: '' };
    if (m === '1/2-1/2' || m === '1-0' || m === '0-1') {
        return document.getElementById('right_arrow').classList.remove('allowed');
    } else if (m.startsWith('O')) {
        if (m == 'O-O') {
            var a = document.getElementById(`5,${currentPlayer == 1 ? '8' : '1'}`);
            var b = document.getElementById(`8,${currentPlayer == 1 ? '8' : '1'}`);
            if (a && b) {
                a.setAttribute('style', `transform:translate(480px,${currentPlayer == 1 ? 0 : 560}px);`);
                b.setAttribute('style', `transform:translate(400px,${currentPlayer == 1 ? 0 : 560}px);`);
                a.id = `7,${a.id.split(',')[1]}`;
                b.id = `6,${b.id.split(',')[1]}`;
            };
        } else {
            var a = document.getElementById(`5,${currentPlayer == 1 ? '8' : '1'}`);
            var b = document.getElementById(`1,${currentPlayer == 1 ? '8' : '1'}`);
            if (a && b) {
                a.setAttribute('style', `transform:translate(80px,${currentPlayer == 1 ? 0 : 560}px);`);
                b.setAttribute('style', `transform:translate(160px,${currentPlayer == 1 ? 0 : 560}px);`);
                a.id = `3,${a.id.split(',')[1]}`;
                b.id = `2,${b.id.split(',')[1]}`;
            };
        };
        pastPiece.id = m;
        lastMoves.set(`${currentMove}-${currentPlayer}`, pastPiece);
        return;
    };
    if (m[0].match(/[BKQNRP]/)) {
        if (m[0] === 'B') piece = 'Bishop'
        else if (m[0] === 'K') piece = 'King'
        else if (m[0] === 'Q') piece = 'Queen'
        else if (m[0] === 'N') piece = 'Knight'
        else if (m[0] === 'R') piece = 'Rook'
        else if (m[0] === 'P') piece = 'Piece';
        m = m.slice(1);
    };
    if (m[0].match(/[a-h]/) && m[1].match(/[a-hx]/)) {
        oldColumn = letter(m[0]);
        m = m.slice(1);
    } else if (m[0].match(/[1-8]/) && m[1].match(/[a-hx]/)) {
        oldLine = parseInt(m[0]);
        m = m.slice(1);
    } else if (m.length > 3 && m[0].match(/[a-h]/) && m[1].match(/[1-8]/) && m[2].match(/[a-hx]/)) {
        oldColumn = letter(m[0]);
        oldLine = parseInt(m[1]);
        m = m.slice(2);
    };
    if (m[0] === 'x') {
        taken = true;
        m = m.slice(1);
    };
    const column = letter(m[0]);
    const line = parseInt(m[1]);
    if (oldColumn > 0 && oldLine > 0) {
        let p = document.getElementById(`${oldColumn},${oldLine}`);
        pastPiece.position = p.style.transform;
        pastPiece.lastId = p.id;
        p.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);
`);
        if (taken) {
            var z = document.getElementById(`${column},${line}`);
            pastPiece.taken = z.outerHTML;
            z.remove();
        };
        p.id = `${column},${line}`;
        pastPiece.id = p.id;
    } else if (oldColumn > 0 || oldLine > 0) {
        for (const o of document.querySelectorAll(`.${piece}.${currentPlayer === 0 ? 'white' : 'black'}_piece`)) {
            if ((o.id.split(',')[0] == oldColumn || o.id.split(',')[1] == oldLine) && isIn(`${column},${line}`, validCells(o.id.split(','), piece, currentPlayer))) {
                pastPiece.position = o.style.transform;
                pastPiece.lastId = o.id;
                o.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);
`);
                if (taken) {
                    var e = document.getElementById(`${column},${line}`);
                    pastPiece.taken = e.outerHTML;
                    e.remove();
                };
                o.id = `${column},${line}`;
                pastPiece.id = o.id;
                break;
            };
        };
    } else {
        for (const o of document.querySelectorAll(`.${piece}.${currentPlayer === 0 ? 'white' : 'black'}_piece`)) {
            if (isIn(`${column},${line}`, validCells(o.id.split(','), piece, currentPlayer))) {
                pastPiece.position = o.style.transform;
                pastPiece.lastId = o.id;
                o.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);
`);
                if (taken) {
                    var e = document.getElementById(`${column},${line}`);
                    pastPiece.taken = e.outerHTML;
                    e.remove();
                };
                o.id = `${column},${line}`;
                pastPiece.id = o.id;
                break;
            };
        };
    };
    lastMoves.set(`${currentMove}-${currentPlayer}`, pastPiece);
};
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
        if (a === c) return true;
    } return false;
};
function validCells(position, type, color) {
    const x = parseInt(position[0]);
    const y = parseInt(position[1]);
    let valid_cells = [];
    if (type == 'King') {
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
        for (const [a, b] of coord) {
            valid_cells.push(`${a + x},${b + y}`);
        };
    } else if (type == 'Queen') {
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
        for (const [a, b] of coord) {
            for (var i = 0;
                i < 9;
                i++) {
                valid_cells.push(`${i * a + x},${i * b + y}`);
            };
        };
    } else if (type == 'Rook') {
        const coord = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        for (const [a, b] of coord) {
            for (var i = 0;
                i < 9;
                i++) {
                valid_cells.push(`${a * i + x},${b * i + y}`);
            };
        };
    } else if (type == 'Bishop') {
        const coord = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (const [a, b] of coord) {
            for (var i = 0;
                i < 9;
                i++) {
                valid_cells.push(`${a * i + x},${b * i + y}`);
            };
        };
    } else if (type == 'Knight') {
        valid_cells = [`${x + 2},${y + 1}`, `${x + 1},${y + 2}`, `${x + 2},${y - 1}`, `${x - 2},${y + 1}`, `${x + 1},${y - 2}`, `${x - 1},${y + 2}`, `${x - 2},${y - 1}`, `${x - 1},${y - 2}`];
    } else {
        valid_cells.push(`${x},${y + (color == 0 ? 1 : -1)}`);
        if (document.getElementById(`${x + 1},${y + (color == 0 ? 1 : -1)}`)?.classList.contains(color == 0 ? 'black_piece' : 'white_piece')) valid_cells.push(`${x + 1},${y + (color == 0 ? 1 : -1)}`);
        if (document.getElementById(`${x - 1},${y + (color == 0 ? 1 : -1)}`)?.classList.contains(color == 0 ? 'black_piece' : 'white_piece')) valid_cells.push(`${x - 1},${y + (color == 0 ? 1 : -1)}`);
        if (y == (color == 0 ? 2 : 7)) valid_cells.push(`${x},${y + (color == 0 ? 2 : -2)}`);
    };
    return valid_cells;
}