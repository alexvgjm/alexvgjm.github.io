document.addEventListener('DOMContentLoaded', ()=>{
    function initMenuBehaviour() {
        const toggleMenuButton = document.querySelector('.menu-button')
        const mainHeader       = document.querySelector('.main-header')
        
        toggleMenuButton.addEventListener('click', ()=>{
            mainHeader.classList.toggle('main-header--open')
        })
    }

    initMenuBehaviour()
})