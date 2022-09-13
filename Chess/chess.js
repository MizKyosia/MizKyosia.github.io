const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ended = false;
var currentMove = 0;
let moves = [];
let lastMoves = [];
let selectedPiece;
let originalPlate;
let last;
let direction;
let took = 0;
let check = [false, false];
let draggedPiece;
let promotedPiece;
let PGN = [];
var result = '0-1';
var file = null;
document.addEventListener("DOMContentLoaded", function (event) {
    originalPlate = document.getElementById('plate').innerHTML;
    this.addEventListener('keydown', function (e) {
        if (e.key == "Escape") {
            if (document.getElementById('pause').classList.contains('appear')) document.getElementById('pause').classList.remove('appear')
            else if (!document.getElementById('pause').classList.contains('appear') && !document.getElementById('choice').classList.contains('appear')) document.getElementById('pause').classList.add('appear')
            else if (document.getElementById('help').style.display == "flex") document.getElementById('return').click();
        } else if (e.key == 'ArrowLeft') document.getElementById('left_arrow').click()
        else if (e.key == 'ArrowRight') document.getElementById('right_arrow').click()
    });
    for (const c of document.querySelectorAll('.choices')) c.addEventListener('click', choose);
    loadPage();
});
function download(){
    const date = new Date();
    var content = `[Event "Casual game"]\n[Site "Website (mizkyosia.github.io/Chess)"]\n[Date "${date.getFullYear()}.${date.getMonth()}.${date.getDate()}"]\n[Result "${result}"]\n\n`;
    var line = '';
    for(let i = 0;i < PGN.length;i+=2){;
        console.log(`${i/2+1}.${PGN[i]} ${PGN[i+1]}`);
        line += `${i/2+1}.${PGN[i]} ${PGN[i+1] ? PGN[i+1] + ' ' : ''}`;
        if(line.length > 100){
            content += line + '\n';
            line = '';
        }
    }
    content += line + result;
    var data = new Blob([content], {type: '.pgn'});

    // // If we are replacing a previously generated file we need to
    // // manually revoke the object URL to avoid memory leaks.
    if (file !== null) {
      window.URL.revokeObjectURL(file);
    }
    file = window.URL.createObjectURL(data);
    document.getElementById('pgn').href = file;
    document.getElementById('pgn').download = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()} ${date.getHours()}h${date.getMinutes()}.pgn`
    document.getElementById('download').setAttribute('onclick',"document.getElementById('pgn').click()")
    document.getElementById('pgn').click()
}

function loadPage() {
    document.getElementById('plate').innerHTML = originalPlate;
    currentMove = 0;
    last = null;
    ended = false;
    took = 0;
    draggedPiece = null;
    moves = [];
    lastMoves = [];
    PGN = [];
    last = null;
    document.querySelectorAll('.black_piece').forEach(e => {
        e.draggable = false;
        e.classList.add('no-drag')
    });
    document.getElementById('file').onchange = load;
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
    });
    document.getElementById('announcement').innerHTML = 'Au tour du joueur <span id="player">blanc</span> !'
    document.getElementById('info').innerHTML = ''
    document.getElementById('black').innerHTML = ''
    document.getElementById('white').innerHTML = ''
    document.getElementById('moves')?.remove()
    document.getElementById('left_arrow').classList?.remove('allowed')
    document.getElementById('right_arrow').classList.remove('allowed')
    document.getElementById('pause').classList.remove('appear')
    document.getElementById('download').setAttribute('style','display:none;')
    document.getElementById('pgn').setAttribute('download','')
    document.getElementById('file').value = ''
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
    dropCell(this);
};
function dropCell(cell) {
    check = [false, false]
    var ended = false;
    var move = '';
    var taken = false;
    var column = true;
    var row = true;
    var only = true;
    if (!cell.classList.contains('highlight') || cell.classList.contains('not-allowed')) return false;
    if (!cell.firstElementChild || draggedPiece.id != cell.firstElementChild.id) {
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
            move = rook.id.split(',')[0] == '1' ? 'O-O-O' : 'O-O';
            document.getElementById(`${direction ? '7' : '2'},${king.classList[2] == 'white_piece' ? '1' : '8'}`).append(king);
            document.getElementById(`${direction ? '6' : '3'},${king.classList[2] == 'white_piece' ? '1' : '8'}`).append(rook);
        } else {
            if(draggedPiece.classList[0] != 'Pawn') move += (draggedPiece.classList[0] == 'Knight' ? 'N' : draggedPiece.classList[0][0]);
            document.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                if(p.id == draggedPiece.id) return;
                let test = true;
                validCellsGame(p).forEach(c => {test = c.id != cell.id; console.log(c.id,cell.id)});
                only &&= test;
            })
            if(!only){
                draggedPiece.parentElement.parentElement.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                    if(p.id == draggedPiece.id) return;
                    var test = true;
                    validCellsGame(p).forEach(c => test = c.id != cell.id);
                    row &&= test;
                })
                if(!row){
                        document.querySelectorAll(`.${draggedPiece.classList[2]}.${draggedPiece.classList[0]}`).forEach(p => {
                        if(p.id == draggedPiece.id || p.parentElement.id.split(',')[0] != draggedPiece.parentElement.id.split(',')[0]) return;
                        var test = true;
                        validCellsGame(p).forEach(c => test = c.id != cell.id);
                        column &&= test; 
                        })
                        if(column && row) move += `${alphabet[parseInt(cell.id.split(',')[0])-1]}${cell.id.split(',')[1]}`
                        else if(column) move += `${alphabet[parseInt(cell.id.split(',')[0])-1]}`
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
            } else {
                document.querySelectorAll('.choices').forEach(e => e.src = `./Images/${e.id.toLowerCase()}_${draggedPiece.classList[2] == 'white_piece' ? 'white' : 'black'}.png`);
                draggedPiece.classList.remove('translated');
                if (!draggedPiece.classList.contains('moved')) draggedPiece.classList.add('moved');
                cell.appendChild(draggedPiece);
                if (cell.id.split(',')[1] == (cell.firstElementChild.classList[2] == 'black_piece' ? 1 : 8) && cell.firstElementChild.classList[0] == "Pawn") {
                    document.getElementById('choice').classList.add('appear');
                    promotedPiece = cell.firstElementChild;
                };
            }
            move += `${taken ? 'x' : ''}${alphabet[parseInt(cell.id.split(',')[0])-1]}${cell.id.split(',')[1]}`
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
                    c.firstElementChild.classList.add('not-allowed')
                }
            };
        });
        document.getElementById('player').innerHTML = draggedPiece.classList[2] == 'white_piece' ? 'noir' : 'blanc';
        draggedPiece = null;
        if (ended) endgame();
    };
    cell.classList.remove('over');
    PGN.push(move)
    currentMove == 0 ? currentMove = 1 : currentMove = 0;
    return true;
};

function endgame() {
    if (ended) return;
    ended = true;
    console.log('test')
    for (const p of document.querySelectorAll('.piece')) {
        p.draggable = false;
        p.classList.add('no-drag');
    };
    document.getElementById('announcement').innerHTML = `Le joueur <span id="player">${document.getElementById("player").innerHTML}</span> a gagné !`;
    document.getElementById('download').setAttribute('style','');
    alert("Partie terminée !");
};
function load() {
    currentMove = 0;
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        loadPage()
        var lines = this.result.replace(/ {2,}/, ' ').split('\n');
        document.getElementById('announcement').innerHTML = "Reconstitution d'un match";
        var oldLine = lines[0];
        let add = '';
        while (oldLine.startsWith('[')) {
            if (document.getElementById(oldLine.split(' "')[0].replace('[', '').toLowerCase())) document.getElementById(oldLine.split(' "')[0].replace('[', '').toLowerCase()).innerHTML = oldLine.split(' "')[0].replace('[', '') + ' : ' + oldLine.split(' "')[1].replace('"]', '')
            else add += `<h3 id="${oldLine.split(' "')[0].replace('[', '').toLowerCase()}">${oldLine.split(' "')[0].replace('[', '')} : ${oldLine.split(' "')[1].replace('"]', '')}</h3>`;
            lines.shift();
            oldLine = lines[0];
        };
        document.getElementById('info').innerHTML = add;
        let m = lines.join(' ').replace(/\{(.|\n)*?\}/g, '').replace(/\((.|\n)*?\)/g, '').replace(/;.*/g, '').replace(/\r/g, "").split(/[0-9]{1,}\./g).map(e => {
            while (e.endsWith(' ')) { e = e.slice(0, e.length - 1) };
            while (e.startsWith(' ')) { e = e.slice(1) };
            return e.split(' ');
        });
        while (m[0] == '') m.shift();
        moves[0] = 'start'
        let x = 1
        m.forEach(z => {
            z.forEach(y => {
                moves[x] = y
                x++
            })
        })
        if (m.length > 0) document.getElementById('right_arrow').classList.add('allowed');
        setPlate();
        alert(`===========Attention=========== !\n\nLe visualisateur de fichier PGN contient encore des bugs. J'essaie de les supprimer le plus vite possible, mais il reste encore quelques soucis.`)
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
        cell.classList.remove('highlight', 'castle', 'ep');
    };
    for (const cell of document.querySelectorAll(".over")) {
        cell.classList.remove('over');
    };
};
function clickCell(e) {
    if (!draggedPiece || this.firstElementChild?.id == draggedPiece.id) return;
    if (this.classList.contains('highlight')) {
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
function move(p) {
    const x = parseInt(p.parentElement.id.split(',')[0]);
    const y = parseInt(p.parentElement.id.split(',')[1]);
    draggedPiece = p;
    unlightPlate();
    if (check[currentMove]) {
        if (p.classList[0] != 'King') return;
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
        if (p.classList[0] == 'King' && !p.classList.contains('check')) document.querySelectorAll(`.Rook.${p.classList[2]}`).forEach(c => {
            if (!c.classList.contains('moved') && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${c.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${c.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) {
                c.parentElement.classList.add('highlight', 'castle');
                direction = c.parentElement.id.split(',')[0] == '8';
            }
        })
        else if (p.classList[0] == 'Rook' && !document.querySelector(`.King.${p.classList[2]}`).classList.contains('check')) {
            if (!p.classList.contains('moved') && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '7' : '2'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0 && document.getElementById(`${p.parentElement.id.split(',')[0] == '8' ? '6' : '3'},${p.parentElement.id.split(',')[1] == '8' ? '8' : '1'}`).childElementCount == 0) document.querySelector(`.King.${p.classList[2]}`).parentElement.classList.add('highlight', 'castle')
            direction = p.parentElement.id.split(',')[0] == '8'
        }
    }
    last = p.parentElement.id
}
function setPlate() {
    document.getElementById('plate').innerHTML = originalPlate;
    let m = '<button id="move_0" class="moves" style="background-color:rgb(0,255,0);color:black;" onclick="clickMove(0)">Début</button>'
    for (let i = 1; i < moves.length; i++) {
        m += `\n<button id="move_${i}" class="moves ${i != moves.length - 1 ? (i % 2 == 1 ? 'white_move"' : 'black_move') : ''}" onclick="clickMove(${i})">${moves[i]}</button>`
    }
    document.getElementById('fileButton').outerHTML = `<div id="moves">${m}</div>` + document.getElementById('fileButton').outerHTML
    document.querySelectorAll('.piece').forEach(e => {
        e.draggable = false;
        e.classList.add('no-drag')
    });
    for (const p of document.querySelectorAll('.piece')) {
        if (p.parentElement.id != 'plate') {
            p.setAttribute('style', `transform:translate(${parseInt(p.parentElement.id.split(',')[0] * 80 - 80)}px,${640 - (parseInt(p.parentElement.id.split(',')[1]) * 80)}px);`);
            p.id = p.parentElement.id;
            p.parentElement.id = 'null';
        } else {
            p.setAttribute('style', `transform:translate(${parseInt(p.id.split(',')[0]) * 80 - 80}px,${640 - (parseInt(p.id.split(',')[1]) * 80)}px);`);
        };
        document.getElementById('plate').appendChild(p).classList.add('simulation');
    };
    for (const c of document.querySelectorAll('.cell')) {
        c.id = 'null';
    };
};
function back(c) {
    if (!c.contains('allowed')) return;
    document.getElementById('move_' + currentMove.toString()).setAttribute('style', '')
    if (currentMove == moves.length - 1) document.getElementById('right_arrow').classList.add('allowed');
    currentMove--
    document.getElementById('move_' + currentMove.toString()).setAttribute('style', "background-color:rgb(0,255,0);color:black;")
    if (currentMove == 0) document.getElementById('left_arrow').classList.remove('allowed');
    let m = lastMoves.pop();
    if (m.id == '1/2-1/2' || m.id == '1-0' || m.id == '0-1') {
        return document.getElementById('result').style.display = 'none'
    } else if (m.id === 'O-O-O') {
        var a = document.getElementById(`3,${currentMove % 2 == 0 ? '1' : '8'}`);
        var b = document.getElementById(`2,${currentMove % 2 == 0 ? '1' : '8'}`);
        a.setAttribute('style', `transform:translate(320px,${currentMove % 2 == 0 ? 560 : 0}px);`);
        b.setAttribute('style', `transform:translate(0px,${currentMove % 2 == 0 ? 560 : 0}px);`);
        a.id = `5,${a.id.split(',')[1]}`;
        b.id = `1,${b.id.split(',')[1]}`;
        return;
    } else if (m.id === 'O-O') {
        var a = document.getElementById(`7,${currentMove % 2 == 0 ? '1' : '8'}`);
        var b = document.getElementById(`6,${currentMove % 2 == 0 ? '1' : '8'}`);
        a.setAttribute('style', `transform:translate(320px,${currentMove % 2 == 0 ? 560 : 0}px);`);
        b.setAttribute('style', `transform:translate(560px,${currentMove % 2 == 0 ? 560 : 0}px);`);
        a.id = `5,${a.id.split(',')[1]}`;
        b.id = `8,${b.id.split(',')[1]}`;
        return;
    };
    const p = document.getElementById(m.id);
    p.setAttribute('style', `transform:${m.position}`);
    p.id = m.lastId;
    if (m.taken) {
        var z = document.getElementById(m.taken.toString())
        z.style.display = '';
        z.id = m.id
        took--;
    }
};
function next(c) {
    if (!c.contains('allowed')) return;
    if (currentMove === 0) {
        document.getElementById('left_arrow').classList.add('allowed');
    }
    if (currentMove == 0) document.getElementById('left_arrow').classList.add('allowed');
    document.getElementById('move_' + currentMove.toString()).setAttribute('style', '')
    currentMove++
    if (currentMove == moves.length - 1) document.getElementById('right_arrow').classList.remove('allowed');
    document.getElementById('move_' + currentMove.toString()).setAttribute('style', "background-color:rgb(0,255,0);color:black;")
    let m = moves[currentMove];
    let piece = 'Pawn';
    let oldColumn = 0;
    let oldLine = 0;
    var taken = false;
    let pastPiece = { lastId: '', position: '', id: '', taken: null };
    if (m === '1/2-1/2' || m === '1-0' || m === '0-1') {
        document.getElementById('right_arrow').classList.remove('allowed');
        document.getElementById('wr').innerHTML = m.split('-')[0]
        document.getElementById('br').innerHTML = m.split('-')[1]
        var result = document.getElementById('result')
        result.setAttribute('style', result.style.cssText.split('display')[0] + 'display: flex;')
        pastPiece.id = m
    } else if (m.startsWith('O')) {
        if (m == 'O-O') {
            var a = document.getElementById(`5,${currentMove % 2 == 1 ? '8' : '1'}`);
            var b = document.getElementById(`8,${currentMove % 2 == 1 ? '8' : '1'}`);
            if (a && b) {
                a.setAttribute('style', `transform:translate(480px,${currentMove % 2 == 1 ? 0 : 560}px);`);
                b.setAttribute('style', `transform:translate(400px,${currentMove % 2 == 1 ? 0 : 560}px);`);
                a.id = `7,${a.id.split(',')[1]}`;
                b.id = `6,${b.id.split(',')[1]}`;
            };
        } else {
            var a = document.getElementById(`5,${currentMove % 2 == 1 ? '8' : '1'}`);
            var b = document.getElementById(`1,${currentMove % 2 == 1 ? '8' : '1'}`);
            if (a && b) {
                a.setAttribute('style', `transform:translate(80px,${currentMove % 2 == 1 ? 0 : 560}px);`);
                b.setAttribute('style', `transform:translate(160px,${currentMove % 2 == 1 ? 0 : 560}px);`);
                a.id = `3,${a.id.split(',')[1]}`;
                b.id = `2,${b.id.split(',')[1]}`;
            };
        };
        pastPiece.id = m;
        lastMoves.push(pastPiece);
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
        p.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);`);
        if (taken) {
            var z = document.getElementById(`${column},${line}`);
            took++;
            pastPiece.taken = took;
            z.style.display = 'none';
            z.id = took.toString();
        };
        p.id = `${column},${line}`;
        pastPiece.id = p.id;
    } else if (oldColumn > 0 || oldLine > 0) {
        for (const o of document.querySelectorAll(`.${piece}.${currentMove % 2 === 1 ? 'white' : 'black'}_piece`)) {
            if ((o.id.split(',')[0] == oldColumn || o.id.split(',')[1] == oldLine) && isIn(`${column},${line}`, validCells(o.id.split(','), piece, currentMove % 2 == 1))) {
                pastPiece.position = o.style.transform;
                pastPiece.lastId = o.id;
                o.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);`);
                if (taken) {
                    var e = document.getElementById(`${column},${line}`);
                    took++;
                    pastPiece.taken = took;
                    e.style.display = 'none';
                    e.id = took.toString();
                };
                o.id = `${column},${line}`;
                pastPiece.id = o.id;
                break;
            };
        };
    } else {
        for (const o of document.querySelectorAll(`.${piece}.${currentMove % 2 === 1 ? 'white' : 'black'}_piece`)) {
            if (isIn(`${column},${line}`, validCells(o.id.split(','), piece, currentMove % 2 == 1))) {
                pastPiece.position = o.style.transform;
                pastPiece.lastId = o.id;
                o.setAttribute('style', `transform:translate(${column * 80 - 80}px,${640 - line * 80}px);`);
                if (taken) {
                    var e = document.getElementById(`${column},${line}`);
                    took++;
                    pastPiece.taken = took;
                    e.style.display = 'none';
                    e.id = took.toString();
                };
                o.id = `${column},${line}`;
                pastPiece.id = o.id;
                break;
            };
        };
    };
    lastMoves.push(pastPiece);
};
function clickMove(number) {
    if (number == currentMove) return
    while (number < currentMove) back(document.getElementById('left_arrow').classList)
    while (number > currentMove) next(document.getElementById('right_arrow').classList)
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
        valid_cells.push(`${x},${y + (color ? 1 : -1)}`);
        if (document.getElementById(`${x + 1},${y + (color ? 1 : -1)}`)?.classList.contains(color ? 'black_piece' : 'white_piece')) valid_cells.push(`${x + 1},${y + (color ? 1 : -1)}`);
        if (document.getElementById(`${x - 1},${y + (color ? 1 : -1)}`)?.classList.contains(color ? 'black_piece' : 'white_piece')) valid_cells.push(`${x - 1},${y + (color ? 1 : -1)}`);
        if (y == (color ? 2 : 7)) valid_cells.push(`${x},${y + (color ? 2 : -2)}`);
    };
    return valid_cells;
}