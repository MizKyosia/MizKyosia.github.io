document.addEventListener("DOMContentLoaded", (event) => {
    const params = new URLSearchParams(window.location.search)
    // console.log(window.innerWidth,window.innerHeight)
    if(!params.get("anim") && params.get("anim") !== "up" && params.get("anim") !== "down") params.set("anim","up")
    setTimeout(() => {
        document.getElementById("anim").style.top = `${params.get("anim") === "up" ? -150 : 150}vh`
        document.addEventListener('keydown', (event) => {
            if(event.key === "ArrowLeft") document.querySelector('.back')?.click()
            else if(event.key === "ArrowRight") document.querySelector('.next')?.click()
        })
    }, 400);
    for(const txt of document.querySelectorAll("h4")){
        txt.addEventListener('mouseenter',(event) => {
            txt.lastElementChild?.classList.add('appear')
        })
        txt.addEventListener('mouseleave',(event) => {
            txt.lastElementChild?.classList.remove('appear')
        })
    }
    for(const i of document.querySelectorAll('img')){
        if(i.id !== "anim") i.addEventListener('click', (e) => window.open(i.src,'_blank'))
    }
})

let angle = 0;


window.setInterval(() => {
    if(angle >= 360) angle -= 360
    angle++
    document.body.style.backgroundImage = `linear-gradient(${angle}deg, gold -50vh, orangered 150vh)`
}, 35)

// window.addEventListener('mousemove', (event) => {
//     console.log(event.clientX,event.clientY)
// })

function link(url,dir){
    const e = document.getElementById("anim")
    e.style.transition = "none"
    e.style.top = `${dir === "down" ? -150 : 150}vh`
    setTimeout(() => {
        e.style.transition = ""
        e.style.top = `-25vh`
        setTimeout(() => {
            window.open(`${url}?anim=${dir}`,"_self")
        }, 400);
    }, 1);
}