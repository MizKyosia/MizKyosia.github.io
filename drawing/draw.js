/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {CanvasRenderingContext2D} */
let pctx;
/** @type {HTMLImageElement} */
var cursor, color = -1, previousPos, previousColor, startDrawPos, pen = 0, colorPicker, editedColor, colorOption = 0;
document.addEventListener('DOMContentLoaded', () => {
    ctx = document.getElementById('drawing').getContext('2d');
    pctx = document.getElementById('drawingPreview').getContext('2d');
    cursor = document.getElementById('cursor');
    colorPicker = document.getElementById('colorPicker');
    changePenSize(5)
    resizeCanvas();
    ctx.lineCap = 'round';
    document.getElementById('addColor').addEventListener('click', (e) => addColor(e));
    document.addEventListener('auxclick', (e) => false);
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('color') || e.target.classList.contains('selectedColor') || e.target.id.includes('drawing')) {
            e.preventDefault();
            return false;
        }
    });
    document.addEventListener('mousedown', (e) => {
        if (e.target.id != 'colorPicker' && editedColor) stopEdit();
        if (e.target.classList.contains('color') || e.target.classList.contains('selectedColor')) return colorAction(e);
        else if (e.target.id.includes('drawing')) {
            e.preventDefault();
            color = e.button;
            if (pen == Pens.base) drawBase(e);
            return false;
        };
    });
    document.addEventListener('mouseup', (e) => {
        previousPos = null;
        color = -1;
        return false;
    });
    ctx.canvas.addEventListener('mouseenter', (e) => cursor.parentElement.style.display = '');
    ctx.canvas.addEventListener('mouseleave', (e) => cursor.parentElement.style.display = 'none');
    ctx.canvas.addEventListener('mousemove', (e) => {
        cursor.parentElement.style.left = `${e.pageX}px`;
        cursor.parentElement.style.top = `${e.pageY}px`;
        if (color >= 0) draw(e);
    });
})

/**
 * @param {number} max The maximum number
 * @param {number} min The minimum number
 * @returns {number} A random number in range [min;max]
 */
function randomBetween(max, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const hexDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
/**
 * @param {boolean} alpha Should the alpha channel be randomized too ?
 * @returns {string} A random hex color code
 */
function randomHexColor(a = false) {
    let s = '#';
    for (let i = 0; i < (a ? 8 : 6); i++) s += hexDigits[randomBetween(15)];
    return s;
}

function fsElem() {
    return (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
}

function fullScreen() {
    if (fsElem()) document.exitFullscreen();
    else ctx.canvas.parentElement.requestFullscreen();
}

function addColor(e) {
    if (editedColor) stopEdit();
    var a = document.createElement('button');
    a.style = 'background-color: black; box-shadow: inset 0 0 0 50px black;';
    a.className = 'color';
    document.getElementById('colors').appendChild(a);
    startEdit(e,a);
}

function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.scrollX || document.documentElement.scrollLeft,
        scrollTop = window.scrollY || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function stopEdit() {
    editedColor.classList.remove('editing');
    editedColor = null;
}

function editColor(c) {
    if (!editedColor) return;
    editedColor.style = `background-color: ${c}; box-shadow: inset 0 0 0 50px ${c}`;
}

//#region penSettings

function changeOption(e,o){
    colorOption = o;
    document.getElementById('colors').className = `action${colorOption}`;
    document.querySelector('.colorOption.selected').classList.remove('selected');
    e.classList.add('selected');
    console.log(e,colorOption);
}

function startEdit(e,a){
    editedColor = a;
    editedColor.classList.add('editing');
    var o = offset(e.target);
    colorPicker.style.left = `${o.left}px`;
    colorPicker.style.top = `${o.top}px`;
    colorPicker.click();
}

function colorAction(e){
    console.log(colorOption);
    switch(colorOption) {
        case 0: return selectColor(e);
        case 1: return startEdit(e,e.target);
        case 2: return e.target.remove();
    }
    return;
}

/**
 * @param {MouseEvent} e
 */
function selectColor(e) {
    e.preventDefault();
    var c = e.target.id ? e.target.parentElement : e.target;
    if (document.querySelector(`.color${e.button}`) == c) {
        c.classList.remove(`color${e.button}`);
        c.querySelector(`#color${e.button}`).remove();
        return false;
    }
    if (document.querySelector(`.color${e.button}`)) {
        document.querySelector(`#color${e.button}`).remove();
        document.querySelector(`.color${e.button}`).classList.remove(`color${e.button}`);
    }
    c.classList.add(`color${e.button}`);
    c.innerHTML += `<span id="color${e.button}" class="selectedColor">${e.button + 1}</span>`;
    return false;
}

/**
 * @param {string} p 
 */
function changePen(p) {
    pen = Pens[p];
}

/**
 * @param {number} v 
 */
function changePenSize(v) {
    ctx.lineWidth = v;
    for (var e of document.querySelectorAll('.shape')) e.style.strokeWidth = v;
    cursor.setAttribute('r', v / 2);
}

function changeShapes(f) {
    console.log(f);
    for (var e of document.querySelectorAll('.shape')) (f && e.id != 'line') ? e.classList.remove('hollow') : e.classList.add('hollow');
}
//#endregion

/*setInterval(() => {
    console.log("update")

}, 1)*/

//#region drawing

function draw(e) {
    switch (pen) {
        case 0: return drawBase(e);
        case 1: return drawRectangle(e)
    }
    console.log('problem')
    return false;
}

/**
 * @param {MouseEvent} e 
 */
function drawBase(e) {
    const c = document.querySelector(`.color${color}`)?.style.backgroundColor;
    if (!c) return false;
    if (ctx.fillStyle != c) {
        ctx.fillStyle = c;
        ctx.strokeStyle = c;
    }
    ctx.beginPath();
    let pos = getMousePos(e);
    if (previousPos) {
        ctx.moveTo(pos[0], pos[1])
        ctx.lineTo(previousPos[0], previousPos[1])
    }
    ctx.stroke()
    previousPos = pos;
    return false;
}

/**
 * @param {MouseEvent} e 
 */
function drawRectangle(e) {
    pctx.clearRect();
    if (!startDrawPos) startDrawPos = [e.x, e.y];
    pctx.fillRect(e.x, e.y, startDrawPos[0] - e.x, startDrawPos[1] - e.y);
    return false;
}
//#endregion

/**
 * @param {MouseEvent} e 
 * @returns {[number,number]} Position in [x,y] coordinates
 */
function getMousePos(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return [Math.round(x), Math.round(y)];
}

function download() {
    document.getElementById('download').href = ctx.canvas.toDataURL();
    document.getElementById('download').click();
}

function resizeCanvas() {
    pctx.canvas.width = ctx.canvas.width;
    pctx.canvas.height = ctx.canvas.height;
}

function clearCanvas() {
    pctx.clearRect(0, 0, pctx.canvas.width, pctx.canvas.height);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

const Pens = {
    "base": 0,
    "rectangle": 1,
    "circle": 2,
    "fill": 3
}