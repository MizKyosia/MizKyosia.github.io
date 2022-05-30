document.addEventListener('DOMContentLoaded', (e) => {
    window.setInterval(() => {
        if(phrase.length == 0){
            const d = document.getElementById('container')
            d.style.opacity = "100%"
            d.style.transform = "translateY(0px)"            
            return window.clearInterval()
        }
        document.getElementById('title').innerHTML += phrase.shift()
    }, 150)
})

const phrase = ['H','i',' ', 'I', '\'', 'm', ' ' , 'M', 'i', 'z', 'K', 'y', 'o', 's', 'i', 'a']