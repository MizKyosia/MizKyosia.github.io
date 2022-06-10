// import {POSITION,GridCell, Pawn} from "./src.ts";
/**
 * @type {DivCell[][]}
 */
let grid = [[null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null]]
var ended = false;
var currentMove = 0;
var currentPlayer = -1;
/** @type {Map<string,string>} */
const moves = new Map();
/** @type {Map<string,[string,string]>} */
const lastMoves = new Map()
let selectedPiece;
document.addEventListener("DOMContentLoaded", function (event) {
    const originalPlate = document.getElementById('plate').innerHTML
    this.addEventListener('keydown', function (e) {
        if (e.key == "Escape") {
            if (document.getElementById('pause').classList.contains('appear')) document.getElementById('pause').classList.remove('appear')
            else if (!document.getElementById('pause').classList.contains('appear') && !document.getElementById('choice').classList.contains('appear')) document.getElementById('pause').classList.add('appear')
            else if (document.getElementById('help').style.display == "flex") document.getElementById('return').click()
        }
    })
    document.querySelectorAll('.black_piece').forEach(e => { e.draggable = false; e.classList.add('no-drag') })
    document.getElementById('file').onchange = load
    let cells = document.querySelectorAll(".cell")
    for (const cell of cells) {
        cell.cell = new GridCell(cell.classList.contains('white_cell'), new POSITION(cell.id.split(",")[0], cell.id.split(",")[1]), cell)
        cell.addEventListener("dragenter", dragenter)
        cell.addEventListener("dragleave", dragleave)
        cell.addEventListener("dragover", dragover)
        cell.addEventListener("drop", drop)
        cell.addEventListener('click', clickCell)
    }
    const pieces = document.querySelectorAll(".piece")
    for (const piece of pieces) {
        piece.piece = new types[piece.classList.item(0)](piece.classList.contains('white_piece'), piece.id, piece.classList.item(0).toLowerCase(), piece.parentElement.cell.position.toObject())
        piece.addEventListener("dragstart", dragstart)
        piece.addEventListener("dragend", dragend)
        piece.addEventListener("dragover", dragover)
        piece.addEventListener('click', clickPiece)
        // piece.addEventListener("drop",drop)
    }
    for (const c of document.querySelectorAll('.cell')) {
        try { c.childElementCount > 0 ? c.cell.set_piece(c.firstElementChild.piece) : null; } catch (err) { console.log(err) }
        grid[c.cell.position.y - 1][c.cell.position.x - 1] = c
    }
    for (const c of document.querySelectorAll('.choices')) c.addEventListener('click', choose)
})
/**
 * @type {PieceElement}
 */
let draggedPiece;
/**
 * @type {PieceElement}
 */
let promotedPiece;
/**
 * @param {DragEvent} e L'event
 * @this {PieceElement}
 */
function dragstart(e) {
    this.classList.add('translated')
    this.parentElement.cell.set_piece(null)
    draggedPiece = this
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.dropEffect = "move"
    this.piece.valid_cells().forEach(c => c.cell.highlight())
}

/**
 * 
 * @param {DragEvent} e 
 * @this {PieceElement}
 */
function dragend(e) {
    this.classList.remove('translated')
    unlightPlate()

    // this.outerHTML = draggedPiece
    return false
}

/**
 * 
 * @param {DragEvent} e 
 * @this {DivCell}
 */
function dragleave(e) {
    this.classList.remove('over')
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.dropEffect = "move"
}

/**
 * 
 * @param {DragEvent} e 
 * @this {DivCell}
 */
function dragenter(e) {
    this.classList.add("over")
    if (!this.cell.valid) {
        e.dataTransfer.effectAllowed = "none"
        e.dataTransfer.dropEffect = "none"
    }
}

/**
 * 
 * @param {DragEvent} e 
 * @this {DivCell}
 */
function dragover(e) {
    if (e.preventDefault) e.preventDefault()
    return false
}

function drop(e){
    e.stopPropagation()
    dropCell(this)
}

/**
 * @param {DivCell} cell
 */
function dropCell(cell) {
    var ended = false
    if (!cell.classList.contains('highlight')) return false
    if (cell.cell.get_piece() && cell.cell.piece.color !== draggedPiece.piece.color) cell.innerHTML = ""
    if (!cell.firstElementChild || draggedPiece.id != cell.firstElementChild.id) {
        document.querySelectorAll('.choices').forEach(e => e.src = `./Images/${e.id.toLowerCase()}_${draggedPiece.piece.color ? 'white' : 'black'}.png`)
        draggedPiece.classList.remove('translated')
        draggedPiece.piece.set_position(cell.cell.get_position()).set_moved(true)
        cell.appendChild(draggedPiece)
        cell.cell.set_piece(draggedPiece.piece)
        if (cell.cell.position.y == (cell.cell.piece.color ? 1 : 8) && cell.cell.piece.pieceType == "pawn") {
            document.getElementById('choice').classList.add('appear')
            promotedPiece = cell.children[0]
        }
        document.querySelectorAll('.no-drag').forEach(e => { e.draggable = true; e.classList.remove('no-drag'); })
        document.querySelectorAll(`.${draggedPiece.piece.color ? 'white' : 'black'}_piece`).forEach(e => {
            e.draggable = false;
            e.classList.add('no-drag');
        })
        document.querySelectorAll(`.${cell.cell.piece.color ? 'black' : 'white'}_piece`).forEach(e => {
            for (const c of e.piece.valid_cells()) {
                if (!c.cell.get_piece()) continue;
                if (c.cell.piece.name == `${cell.cell.piece.color ? 'white' : 'black'}_king`) ended = true
            }
        })
        document.getElementById('player').innerHTML = draggedPiece.piece.color ? 'noir' : 'blanc'
        draggedPiece = null
        if (ended) endgame()
    }
    else {
        cell.cell.set_piece(draggedPiece.piece)
    }
    cell.classList.remove('over')
    return true
}

function endgame() {
    if (ended) return
    ended = true
    for (const p of document.querySelectorAll('.piece')) {
        p.draggable = false
        p.classList.add('no-drag')
    }
    document.getElementById('announcement').innerHTML = `Le joueur <span id="player">${document.getElementById("player").innerHTML}</span> a gagné !`
    alert("Partie terminée !")
}

function load() {
    currentMove = 0
    currentPlayer = -1
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        // Entire file
        console.log(this.result);

        // By lines
        /**
         * @type {string[]}
         */
        const lines = this.result.split('\n');
        document.getElementById('announcement').innerHTML = "Reconstitution d'un match"
        document.querySelectorAll('.piece').forEach(e => { e.draggable = false; e.classList.add('no-drag') })
        var line = lines[0]
        while (line.startsWith('[')) {
            console.log(line, line.split(' "')[0].replace('[', '').toLowerCase())
            if (document.getElementById(line.split(' "')[0].replace('[', '').toLowerCase())) document.getElementById(line.split(' "')[0].replace('[', '').toLowerCase()).innerHTML = line.split(' "')[0].replace('[', '') + ' : ' + line.split(' "')[1].replace('"]', '')
            lines.shift()
            line = lines[0]
        }
        const m = lines.join().replace(/\r,/g, "").split(/[0-9]{1,3}\./g).map(e => { while (e.endsWith(' ')) { e = e.slice(0, e.length - 1) }; while (e.startsWith(' ')) { e = e.slice(1) }; return e.split(' '); })
        while (m[0] == '') { m.shift(); console.log('shifted') }
        for (let i = 0; i < m.length; i++) {
            let z = m[i]
            while (z[-1] == ' ') z.pop()
            for (let x = 0; x < z.length; x++) {
                moves.set(`${i}-${x}`, z[x])
            }
        }
        console.log(moves)
        if (m.length > 0) document.getElementById('right_arrow').classList.add('allowed')
        setPlate()
    }
    reader.readAsText(file)
}

/**
 * 
 * @param {InputEvent} e
 * @this {HTMLElement}
 */
function choose(e) {
    document.getElementById('choice').classList.remove('appear')
    console.log(this.id, promotedPiece)
    promotedPiece.piece = new types[this.id](promotedPiece.classList.contains('white_piece'), promotedPiece.id, this.id.toLowerCase(), promotedPiece.parentElement.cell.position)
    promotedPiece.classList.replace('Pawn', this.id)
    promotedPiece.src = promotedPiece.src.replace('pawn', this.id.toLowerCase())
}

function unlightPlate() {
    for (const cell of document.querySelectorAll(".highlight")) {
        cell.cell.unlight()
    }
    for (const cell of document.querySelectorAll(".over")) {
        cell.classList.remove('over')
    }
}

function clickCell(e) {
    if (!draggedPiece || this.firstElementChild?.id == draggedPiece.id) return
    console.log('cell clicked')
    if (this.classList.contains('highlight')) {
        draggedPiece.parentElement.innerHTML = null
        dropCell(this)
        console.log(draggedPiece)
    }
    unlightPlate()
    draggedPiece = null
    return false
}

function clickPiece(e) {
    if(this.classList.contains('no-drag')) return false
    console.log('piece clicked')
    unlightPlate()
    this.parentElement.cell.set_piece(null)
    draggedPiece = this
    this.piece.valid_cells().forEach(c => c.cell.highlight())
    return false
}

function setPlate() {
    for (const p of document.querySelectorAll('.piece')) {
        if (p.parentElement.id != 'plate') {
            p.setAttribute('style', `transform:translate(${parseInt(p.parentElement.id.split(',')[0]) * 80 - 80}px,${parseInt(p.parentElement.id.split(',')[1]) * 80 - 80}px);`)
            p.id = p.parentElement.id
        } else {
            p.setAttribute('style', `transform:translate(${parseInt(p.id.split(',')[0]) * 80 - 80}px,${parseInt(p.id.split(',')[1]) * 80 - 80}px);`)
        }
        document.getElementById('plate').appendChild(p).classList.add('simulation')
    }
}

function back(c) {
    if (!c.contains('allowed')) return
    if (currentMove === 0 && currentPlayer === 0) {
        currentPlayer--
        document.getElementById('left_arrow').classList.remove('allowed')
        setPlate()
        console.log("move : ", currentMove, "   player : ", currentPlayer)
        return
    }
    if (currentMove >= 0 && currentPlayer == 1) currentPlayer--
    else if (currentMove >= 0 && currentPlayer == 0) { currentMove--; currentPlayer = 1 }
    if (currentMove == 0 && currentPlayer == -1) document.getElementById('left_arrow').classList.remove('allowed')
    if (currentMove < moves.length - 1 || (currentMove == moves.length - 1 && currentPlayer == 0)) document.getElementById('right_arrow').classList.add('allowed')
    // else document.getElementById('right_arrow').classList.remove('allowed')
    let m = lastMoves.get(`${currentMove}-${currentPlayer}`)
    lastMoves.delete(`${currentMove}-${currentPlayer}`)
    console.log("move : ", currentMove, "   player : ", currentPlayer, '\n', m, '\n', lastMoves)
}

function next(c) {
    if (!c.contains('allowed')) return
    if (currentMove === 0 && currentPlayer === -1) {
        currentPlayer++
        document.getElementById('left_arrow').classList.add('allowed')
        console.log("move : ", currentMove, "   player : ", currentPlayer)
    }
    else if (currentMove >= 0 && currentPlayer == 0) currentPlayer++
    else if (currentMove >= 0 && currentPlayer == 1) { currentMove++; currentPlayer = 0 }
    if (currentMove == moves.length - 1 && currentPlayer == 1) document.getElementById('right_arrow').classList.remove('allowed')
    if (currentMove < 0 || (currentMove == 0 && currentPlayer == 1)) document.getElementById('left_arrow').classList.add('allowed')
    // else document.getElementById('left_arrow').classList.remove('allowed')
    let m = moves.get(`${currentMove}-${currentPlayer}`)
    let piece = {}
    m
    console.log(m)
    lastMoves.set(`${currentMove}-${currentPlayer}`, m)
    console.log("move : ", currentMove, "   player : ", currentPlayer, '\n', m, '\n', lastMoves)
}

class POSITION {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {POSITION}
     */
    constructor(x, y) { this.x = parseInt(x); this.y = parseInt(y); return this; }
    /**
     * @type {number}
     */
    x
    /**
     * @type {number}
     */
    y
    /**
     * 
     * @returns {string}
     */
    toString() { return this.x.toString() + ',' + this.y.toString() }
    toObject() { return { x: this.x, y: this.y } }
}

class GridCell {
    /**
     * 
     * @param {boolean} color 
     * @param {POSITION} position 
     * @param {HTMLElement} element 
     * @returns {GridCell}
     */
    constructor(color, position, element) {
        this.position = position
        this.color = color
        this.element = element
        return this
    }
    /**
     * @type {POSITION}
     */
    position
    valid = false
    /**
     * @type {boolean}
     */
    color
    /**
     * @type {HTMLElement}
     */
    element
    /**
     * @type {BasePiece}
     */
    piece = null
    /**
     * @type {boolean}
     */
    highlighted = false
    /**
     * 
     * @param {BasePiece|null} piece 
     * @returns {this}
     */
    set_piece(piece) {
        this.piece = piece
        return this
    }
    /**
     * 
     * @returns {BasePiece|null}
     */
    get_piece() {
        return this.piece
    }
    /**
     * 
     * @returns {POSITION}
     */
    get_position() {
        return this.position
    }
    /**
     * 
     * @returns {boolean}
     */
    get_color() {
        return this.color
    }
    /**
     * 
     * @returns {HTMLElement}
     */
    get_element() {
        return this.element
    }
    /**
     * 
     * @returns {this}
     */
    highlight() {
        this.element.classList.add('highlight')
        this.highlighted = true
        this.valid = true
        return this
    }
    /**
     * 
     * @returns {this}
     */
    unlight() {
        this.element.classList.remove('highlight')
        this.highlighted = false
        this.valid = false
        return this
    }

}

class DivCell extends HTMLElement {
    cell = new GridCell()
}

class PieceElement extends HTMLElement {
    piece = new BasePiece()
}

class BasePiece {
    /**
     * 
     * @param {boolean} color 
     * @param {string} name 
     * @param {POSITION} position 
     * @param {string} pieceType
     * @returns 
     */
    constructor(color, name, pieceType, position) {
        this.color = color
        this.name = name
        this.position = position
        this.pieceType = pieceType
        return this;
    }
    /**
     * @type {string}
     */
    pieceType = ''
    /**
     * @type {POSITION}
     */
    position = null
    moved = false
    /**
     * @type {string}
     */
    name = ""
    /**
     * @type {boolean}
     */
    color = null
    /**
     * 
     * @returns {POSITION}
     */
    get_position() {
        return this.position
    }
    /**
     * 
     * @param {POSITION} position
     * @returns {this}
     */
    set_position(position) {
        this.position = position
        this.moved = true
        return this
    }
    /**
     * 
     * @param {boolean} moved 
     * @returns {this}
     */
    set_moved(moved) {
        this.moved = moved
        return this
    }
    /**
     * 
     * @returns {string}
     */
    get_name() {
        return this.name
    }
    /**
     * 
     * @returns {boolean}
     */
    get_color() {
        return this.color
    }

}

class Pawn extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        var double = false
        for (const [y, x, not_empty, m] of [[this.color ? -2 : 0, -1, false, false], [this.color ? -2 : 0, 0, true, false], [this.color ? -2 : 0, -2, true, false], [this.color ? -3 : 1, -1, false, true]]) {
            let c;
            try {
                c = grid[this.position.y + y][this.position.x + x]
            } catch (e) { c = undefined }
            if (!c) continue;
            if (not_empty && c.cell.get_piece() && c.cell.get_piece().get_color() != this.color) valid_cells.push(c)
            else if (not_empty && c.lastElementChild && !c.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(c)
            else if (!m == this.moved && !c.cell.get_piece() && !not_empty && double) { valid_cells.push(c) }
            else if (!c.cell.get_piece() && !c.lastElementChild && !m && !not_empty) { valid_cells.push(c); double = true }
        }
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}

class Rook extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        const coord = [[-1, 0], [0, -1], [0, 1], [1, 0]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (!cell.cell.get_piece().color === this.color) valid_cells.push(cell)
                    break
                } else if (cell.lastElementChild) {
                    if (!cell.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(cell)
                    break
                } else valid_cells.push(cell)
            }
        })
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}

class Bishop extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        const coord = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (!cell.cell.get_piece().color === this.color) valid_cells.push(cell)
                    break
                } else if (cell.lastElementChild) {
                    if (!cell.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(cell)
                    break
                } else valid_cells.push(cell)
            }
        })
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}

class Queen extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (!cell.cell.get_piece().color === this.color) valid_cells.push(cell)
                    break
                } else if (cell.lastElementChild) {
                    if (!cell.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(cell)
                    break
                } else valid_cells.push(cell)
            }
        })
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}

class King extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]]
        for (const [a, b] of coord) {
            let cell;
            try { cell = grid[this.position.y + b - 1][this.position.x + a - 1] } catch (e) { cell = undefined }
            if (!cell) continue;
            if (cell.cell.get_piece()) {
                if (!cell.cell.get_piece().color === this.color) valid_cells.push(cell)
            } else if (cell.lastElementChild) {
                if (!cell.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(cell)
            } else valid_cells.push(cell)
        }
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}

class Horse extends BasePiece {
    /**
     * 
     * @param {DivCell[]} cells 
     * @returns {DivCell[]}
     */
    valid_cells() {
        const valid_cells = []
        const coord = [[-1, -2], [-2, -1], [2, -1], [-1, 2], [2, 1], [1, 2], [-2, 1], [1, -2]]
        for (const [a, b] of coord) {
            let cell;
            try { cell = grid[this.position.y + b - 1][this.position.x + a - 1] } catch (e) { cell = undefined }
            if (!cell) continue;
            if (cell.cell.get_piece()) {
                if (!cell.cell.get_piece().color === this.color) valid_cells.push(cell)
            } else if (cell.lastElementChild) {
                if (!cell.lastElementChild.classList.contains(`${this.color ? 'white' : 'black'}_piece`)) valid_cells.push(cell)
            } else valid_cells.push(cell)
        }
        return valid_cells
    }
    /**
     * 
     * @param {POSITION} position d
     * @param {DivCell[]} cells 
     * @returns {this}
     */
    move(position, cells) {
        if (0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        this.moved = true
        return this
    }
}
const types = { Rook: Rook, Queen: Queen, King: King, Horse: Horse, Bishop: Bishop, Pawn: Pawn }