document.addEventListener("DOMContentLoaded", function (event) {
    const bs = document.querySelectorAll('.openButtons')
    for(const b of bs) b.addEventListener('click',openList)
    const links = document.querySelectorAll('a')
    for(const link of links) if(link.getAttribute('target') != '_blank') link.addEventListener('click',scrollTo)
    const is = document.querySelectorAll('img')
    for(const i of is) i.addEventListener('click',openImage)
    function openList(e){
        const list = document.getElementById(this.classList[0])
        if(!list.classList.contains('closed')){
            list.classList.add('closed')
            this.style.transform = "rotate(180deg)"
        } else {
            list.classList.remove('closed')
            this.style.transform = "rotate(0deg)"
        }
    }
    function scrollTo(e){
        e.preventDefault()
        const elem = document.querySelector(this.getAttribute('href'))
        window.scrollTo({
            top: elem.offsetTop,
            left:0,
            behavior: "smooth"
        })
    }
    function openImage(e){
        if(this.parentElement.tagName != 'BUTTON') window.open(this.getAttribute("src"),'_blank')
    }
})