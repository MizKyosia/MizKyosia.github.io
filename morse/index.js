var error = false;
var uppercase = false;
var ctrl = false;

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key == 'Control' || e.key == 'Shift') ctrl = true
    })
    document.addEventListener('keyup', (e) => {
        if(e.key == 'Enter' && document.getElementById('text') == document.activeElement && !ctrl) {
            e.preventDefault();
            document.getElementById('mrsBtn').click();
        } else if (e.key == 'Enter' && document.getElementById('morse') == document.activeElement && !ctrl){
            e.preventDefault();
            document.getElementById('txtBtn').click();
        } else if (e.key == 'Control' || e.key == 'Shift') ctrl = false
        console.log(e.key, ctrl)
    })
})

function toMorse() {
    var o = '';
    document.getElementById('text').value.replace(/ {1,}/g,' ').split(' ').forEach(w => {
        if(!w) return;
        for(var l of w){
            if(!l) return;
            o += findCode(l) + ' ';
        }
        o += ' ';
    });
    if (error) {
        error = false;
        alert('!!! Some characters given for translation were not valid !!!');
    }
    document.getElementById('morse').value = o.replace(/ *$/,'');
}

function toText() {
    uppercase = true;
    var o = '';
    document.getElementById('morse').value.replace(/ {2,}/g, '  ').split('  ').forEach(w => {
        if(!w) return;
        for(var l of w.split(' ')){
            if(!l) return;
            o += findLetter(l);
        }
        o += ' ';
    });
    if (error) {
        error = false;
        alert('!!! Some characters given for translation were not valid !!!');
    }
    document.getElementById('text').value = o.replace(/ *$/,'');
}

function findLetter(c) {
    if(c == '.-.-.-') uppercase = true;
    else if (c == '........') return '\u2588';
    for (var [a, b] of ALPHABET) {
        if (b == c && uppercase && a.length > 1) {uppercase = false;return a[0]; }
        else if (b == c && a.length > 1) return a[1];
        else if (b == c) return a[0];
    }
    error = true;
    return '\u2588';
}

function findCode(c) {
    for (var [a, b] of ALPHABET) {
        if (a.includes(c)) return b;
    }
    error = true;
    return '........';
}

/*Yippee, time to write the ENTIRE FUCKIN MORSE ALPHABET */

const ALPHABET = [["Aa",'.-'],["Bb",'-...'],["Cc",'-.-.'],["Dd",'-..'],["Ee",'.'],["Ff",'..-.'],["Gg",'--.'],["Hh",'....'],["Ii",'..'],["Jj",'.---'],["Kk",'-.-'],["Ll",'.-..'],["Mm",'--'],["Nn",'-.'],["Oo",'---'],["Pp",'.--.'],["Qq",'--.-'],["Rr",'.-.'],["Ss",'...'],["Tt",'-'],["Uu",'..-'],["Vv",'...-'],["Ww",'.--'],["Xx",'-..-'],["Yy",'-.--'],["Zz",'--..'],['0','-----'],['1','.----'],['2','..---'],['3','...--'],['4','....-'],['5','.....'],['6','-....'],['7','--...'],['8','---..'],['9','----.'],['.','.-.-.-'],[',','--..--'],['?','..--..'],['\'','.----.'],['!','-.-.--'],['!','---.'],['/','-..-.'],['(','-.--.'],[')','-.--.-'],['&','.-...'],[':','---...'],[';','-.-.-.'],['=','-...-'],['+','.-.-.'],['-','-....-'],['_','..--.-'],['"','.-..-.'],['$','...-..-'],['@','.--.-.'],['\n','\n']];