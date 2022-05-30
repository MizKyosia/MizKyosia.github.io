document.addEventListener("DOMContentLoaded", function (event) {
    const buttons = document.querySelectorAll('.openButtons')
    for(const button of buttons){
        button.addEventListener('click',openList)
    }
    const links = document.querySelectorAll('a')
    for(const link of links){
        if(link.getAttribute('target') != '_blank') link.addEventListener('click',scrollTo)
    }
    const ibs = document.querySelectorAll('.open_image')
    for(const ib of ibs) ib.addEventListener('click',openImage)
    /**
     * 
     * @param {HTMLElementEventMap} event
     * @this {HTMLElement}
     */
    function openList(event){
        const list = document.getElementById(this.classList.item(0))
        if(!list.classList.contains('closed')){
            list.classList.add('closed')
            this.style.transform = "rotate(180deg)"
        } else {
            list.classList.remove('closed')
            this.style.transform = "rotate(0deg)"
        }
    }
    /**
     * 
     * @param {Event} event
     * @this {HTMLAnchorElement}
     */
    function openLink(event){

        event.preventDefault()
        window.open(this.href,'_blank')
    }
    /**
     * 
     * @param {Event} event 
     * @this {HTMLAnchorElement}
     */
    function scrollTo(event){
        event.preventDefault()
        const elem = document.querySelector(this.getAttribute('href'))
        window.scrollTo({
            top: elem.offsetTop,
            left:0,
            behavior: "smooth"
        })
    }
    /**
     * 
     * @param {Event} event 
     * @this {HTMLButtonElement}
     */
    function openImage(event){
        window.open(this.children.item(0).getAttribute("src"),'_blank')
    }
})