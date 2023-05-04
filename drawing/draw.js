/** @type {CanvasRenderingContext2D} */
let ctx;
var color = -1;
let id = 0;
document.addEventListener('DOMContentLoaded', () => {
    ctx = document.getElementById('drawing').getContext('2d');
    document.addEventListener('keydown', (e) => document.getElementById('colors').innerHTML += `<div class="color" style="background-color: ${randomHexColor()};">`);
    document.addEventListener('auxclick', (e) => false);
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('color') || e.target.classList.contains('selectedColor') || e.target.id == 'drawing') {
            e.preventDefault();
            return false;
        }
    });
    document.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('color')||e.target.classList.contains('selectedColor')) return selectColor(e);
        else if (e.target.id == 'drawing'){
            e.preventDefault();
            color = e.button;
            return false;
        };
    });
    document.addEventListener('mouseup', (e) => {
        if (e.target.id == 'drawing'){
            color = -1;
            return false;
        }
    });
    ctx.canvas.addEventListener('mousemove', async (e) => color >= 0 ? await draw(e) : false);
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
 * @param {MouseEvent} e 
 */
async function draw(e) {
    let t = Date.now();
    const c = document.querySelector(`.color${color}`)?.style.backgroundColor;
    if (!c) return false;
    let pos = getMousePos(e);
    ctx.beginPath()
    ctx.fillStyle = c;
    ctx.arc(pos[0],pos[1],5,0,2*Math.PI)
    ctx.fill()
    ctx.closePath()
    console.log(Date.now(),t,(Date.now() - t))
    return false;
}

/**
 * @param {MouseEvent} e 
 * @returns {[number,number]} Position in [x,y] coordinates
 */
function getMousePos(e){
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return [Math.round(x),Math.round(y)];
}

function download(){
    document.getElementById('download').href = ctx.canvas.toDataURL();
    document.getElementById('download').click();
}