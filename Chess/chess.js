// import {POSITION,GridCell, Pawn} from "./src.ts";
/**
 * @type {DivCell[][]}
 */
let grid = [[null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null]]
var ended = false;
document.addEventListener("DOMContentLoaded", function (event) {
    const types = {Rook: Rook, Queen: Queen, King:King, Horse: Horse, Bishop:Bishop,Pawn:Pawn}
    const originalPlate = document.getElementById('plate').innerHTML
    this.addEventListener('keydown',function (e){
        if(e.key == "Escape"){
            if(document.getElementById('pause').classList.contains('appear')) document.getElementById('pause').classList.remove('appear')
            else if(!document.getElementById('pause').classList.contains('appear')&&!document.getElementById('choice').classList.contains('appear')) document.getElementById('pause').classList.add('appear')
            else if(document.getElementById('help').style.display == "flex") document.getElementById('return').click()
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
    }
    const pieces = document.querySelectorAll(".piece")
    for (const piece of pieces) {
        piece.piece = new types[piece.classList.item(0)](piece.classList.contains('white_piece'), piece.id, piece.classList.item(0).toLowerCase(), piece.parentElement.cell.position.toObject())
        piece.addEventListener("dragstart", dragstart)
        piece.addEventListener("dragend", dragend)
        piece.addEventListener("dragover", dragover)
        // piece.addEventListener("drop",drop)
    }
    for (const c of document.querySelectorAll('.cell')) {
        try { c.childElementCount > 0 ? c.cell.set_piece(c.firstElementChild.piece) : null; } catch (err) { console.log(err) }
        grid[c.cell.position.y - 1][c.cell.position.x - 1] = c
    }
    for(const c of document.querySelectorAll('.choices')) c.addEventListener('click',choose)
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
        this.piece.valid_cells(document.querySelectorAll('.cell')).forEach(c => c.cell.highlight())
    }

    /**
     * 
     * @param {DragEvent} e 
     * @this {PieceElement}
     */
    function dragend(e) {
        this.classList.remove('translated')
        for (const cell of document.querySelectorAll(".highlight")) {
            cell.cell.unlight()
        }
        for (const cell of document.querySelectorAll(".over")) {
            cell.classList.remove('over')
        }

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

    /**
     * @param {DragEvent} e L'event
     * @this {DivCell}
     */
    function drop(e) {
        e.stopPropagation()
        var ended = false
        if (!this.cell.valid) return false
        if (this.cell.get_piece() && !this.cell.piece.color === draggedPiece.piece.color) this.innerHTML = ""
        if (!this.firstElementChild || draggedPiece.id != this.firstElementChild.id) {
            document.querySelectorAll('.choices').forEach(e => e.src = `./Images/${e.id.toLowerCase()}_${draggedPiece.piece.color ? 'white' : 'black'}.png`)
            draggedPiece.classList.remove('translated')
            draggedPiece.piece.set_position(this.cell.get_position()).set_moved(true)
            this.appendChild(draggedPiece)
            this.cell.set_piece(draggedPiece.piece)
            if(this.cell.position.y == (this.cell.piece.color ? 1 : 8) && this.cell.piece.pieceType == "pawn"){
                document.getElementById('choice').classList.add('appear')
                promotedPiece = this.children[0]
            }
            document.querySelectorAll('.no-drag').forEach(e => { e.draggable = true; e.classList.remove('no-drag'); })
            document.querySelectorAll(`.${draggedPiece.piece.color ? 'white' : 'black'}_piece`).forEach(e => {
                e.draggable = false;
                e.classList.add('no-drag');
            })
            document.querySelectorAll(`.${draggedPiece.piece.color ? 'black' : 'white'}_piece`).forEach(e => {
                for (const c of e.piece.valid_cells()) {
                    if (!c.cell.get_piece()) continue;
                    if (c.cell.piece.name == `${draggedPiece.piece.color ? 'white' : 'black'}_king`) ended = true
                }
            })
            document.getElementById('player').innerHTML = draggedPiece.piece.color ? 'noir' : 'blanc'
            draggedPiece = null
            if(ended) endgame()
        }
        this.classList.remove('over')
        return false
    }

    function endgame() {
        if (ended) return
        ended = true
        for (const p of document.querySelectorAll('.piece')) {
            p.draggable = false
            p.classList.add('no-drag')
        }
        document.getElementById('announcement').innerHTML = `Le joueur <span id="player">${document.getElementById("player").innerHTML == "blanc" ? "noir" : "blanc"}</span> a gagné !`
        alert("Partie terminée !")
    }

    function load() {
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
            document.getElementById('plate').innerHTML = originalPlate
            document.querySelectorAll('.arrows').forEach(c => c.classList.add('allowed'))
            document.getElementById('announcement').innerHTML = "Reconstitution d'un match"
            document.querySelectorAll('.piece').forEach(e => {e.draggable = false; e.classList.add('no-drag')})
            var line = lines[0]
            while(line.startsWith('[')){
                console.log(line,line.split(' "')[0].replace('[','').toLowerCase())
                if(document.getElementById(line.split(' "')[0].replace('[','').toLowerCase())) document.getElementById(line.split(' "')[0].replace('[','').toLowerCase()).innerHTML = line.split(' "')[0].replace('[','') + ' : ' + line.split(' "')[1].replace('"]','')
                lines.shift()
                line = lines[0]
            }
            const moves = lines.join().replace(/\r,/g,"").split(/[0-9]{1,3}\./g).map(e => e.endsWith(' ') ? e = e.slice(0,e.length-1).split(' ') : e.split(' '))
            while(moves[0] == '')moves.shift()
            for(i of moves){if(i[0] == '') i.shift()}
            console.log(moves)
        }
        reader.readAsText(file)
    }
    /**
     * 
     * @param {InputEvent} e
     * @this {HTMLElement}
     */
    function choose(e){
        document.getElementById('choice').classList.remove('appear')
        console.log(this.id, promotedPiece)
        promotedPiece.piece = new types[this.id](promotedPiece.classList.contains('white_piece'), promotedPiece.id, this.id.toLowerCase(), promotedPiece.parentElement.cell.position)
        promotedPiece.classList.replace('Pawn',this.id)
        promotedPiece.src = promotedPiece.src.replace('pawn',this.id.toLowerCase())
    }
})

class POSITION{
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
    toObject() {return {x:this.x,y:this.y}}
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
    valid_cells(cells) {
        const valid_cells = []
        var double = false
        for (const [y, x, not_empty, m] of [[this.color ? -2 : 0, -1, false, false], [this.color ? -2 : 0, 0, true, false], [this.color ? -2 : 0, -2, true, false], [this.color ? -3 : 1, -1, false, true]]) {
            let c;
            try {
                c = grid[this.position.y + y][this.position.x + x]
            } catch (e) { c = undefined }
            if (!c) continue;
            if (not_empty && c.cell.get_piece() && c.cell.get_piece().get_color() != this.color) valid_cells.push(c)
            else if (!m == this.moved && !c.cell.get_piece() && !not_empty && double) { valid_cells.push(c) }
            else if (!c.cell.get_piece() && !m && !not_empty) { valid_cells.push(c); double = true }
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
    valid_cells(cells) {
        const valid_cells = []
        const coord = [[-1, 0], [0, -1], [0, 1], [1, 0]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (cell.cell.get_piece().color == this.color) {
                        break;
                    } else if (!cell.cell.get_piece().color == this.color) {
                        valid_cells.push(cell)
                        break;
                    }
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
    valid_cells(cells) {
        const valid_cells = []
        const coord = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (cell.cell.get_piece().color == this.color) {
                        break;
                    } else if (!cell.cell.get_piece().color == this.color) {
                        valid_cells.push(cell)
                        break;
                    }
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
    valid_cells(cells) {
        const valid_cells = []
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]]
        coord.forEach(([a, b]) => {
            let valid = true
            for (var i = 1; i < 8; i++) {
                let cell;
                try { cell = grid[this.position.y + (i * b) - 1][this.position.x + (i * a) - 1] } catch (e) { cell = undefined }
                if (!cell) break;
                if (cell.cell.get_piece()) {
                    if (cell.cell.get_piece().color == this.color) {
                        break;
                    } else if (!cell.cell.get_piece().color == this.color) {
                        valid_cells.push(cell)
                        break;
                    }
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
    valid_cells(cells) {
        const valid_cells = []
        const coord = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]]
        for (const [a, b] of coord) {
            let cell;
            try { cell = grid[this.position.y + b - 1][this.position.x + a - 1] } catch (e) { cell = undefined }
            if (!cell) continue;
            if (cell.cell.get_piece()) {
                if (cell.cell.get_piece().color == this.color) {
                    continue;
                } else if (!cell.cell.get_piece().color == this.color) {
                    valid_cells.push(cell)
                    continue;
                }
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
    valid_cells(cells) {
        const valid_cells = []
        const coord = [[-1, -2], [-2, -1], [2, -1], [-1, 2], [2, 1], [1, 2], [-2, 1], [1, -2]]
        for (const [a, b] of coord) {
            let cell;
            try { cell = grid[this.position.y + b - 1][this.position.x + a - 1] } catch (e) { cell = undefined }
            if (!cell) continue;
            if (cell.cell.get_piece()) {
                if (cell.cell.get_piece().color == this.color) {
                    continue;
                } else if (!cell.cell.get_piece().color == this.color) {
                    valid_cells.push(cell)
                    continue;
                }
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