/*
Manage page renders and content changes
*/

;(function(){

var renderApp = new Vue({
    el: '#markdown_content'

    , data: {
        html: 'no content'
    }

    , created(){
        bus.renderApp = this;
    }

    , mounted(){
        bus.$on('render-text', this.renderTextHandle.bind(this))
    }

    , methods: {
        renderTextHandle(e){
            /* Render the complete text as a full HTML render*/
            this.html = e.content.render
        }
    }
})
})()
