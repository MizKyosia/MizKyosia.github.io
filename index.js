document.addEventListener('DOMContentLoaded', (e) => {
    for(var e of document.querySelectorAll('.menu > h6 > button')) e.addEventListener('click', (e) => e.target.parentElement.parentElement.classList.contains('closed') ? e.target.parentElement.parentElement.classList.remove('closed') : e.target.parentElement.parentElement.classList.add('closed'));
    for(var a of document.querySelectorAll('a')) a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollTo({behavior:'smooth',left:0,top:document.querySelector(e.target.getAttribute('href')).offsetTop});
        return false;
    })
    var i;
    i = window.setInterval(() => {
        if(phrase.length == 0){
            document.getElementById('container').classList.remove('hidden');           
            return window.clearInterval(i);
        }
        document.getElementById('title').innerHTML += phrase.shift();
    }, 150);
});
const phrase = ['H','i',' ', 'I', '\'', 'm', ' ' , 'M', 'i', 'z', 'K', 'y', 'o', 's', 'i', 'a'];