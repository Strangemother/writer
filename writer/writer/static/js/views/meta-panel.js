
var metaApp = new Vue({
    el: '#meta'
    , mounted(){
        $('.toggle-meta').on('click', this.toggleClick.bind(this))
    }
    , methods: {
        toggleClick(){
            $('.page-info').toggleClass('hidden')
        }
    }
})
