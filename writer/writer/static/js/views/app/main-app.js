var setDarkMode = function(dark){
    $('body')[dark? 'addClass': 'removeClass']('dark')
    if(self['editorApp'] != undefined) {
        editorApp.renderer.darkTheme(dark)
    }
}

var getDarkMode = function(){
    return Boolean(parseInt(localStorage.getItem('darkmode')))
}

setDarkMode(getDarkMode())

var themeApp = new Vue({
    el: '#theme_app'
    , data: {
        dark: (function(){

            return Boolean(parseInt(localStorage.getItem('darkmode')))
        })()
    }
    , methods: {
        invertColor(){
            this.dark = !this.dark;
            setDarkMode(this.dark)
            localStorage.setItem('darkmode', +this.dark)
        }
    }
})
