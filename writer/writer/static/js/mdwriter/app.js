;(function(){
    'set strict'


var html = $('#writer_template').remove().html();
Vue.component('markdown-editor', {
    template: html
    , props: [
        'value'
    ]

    , mounted(){
        console.log('markdown-editor mounted')
        this.renderer = new Renderer(this.$refs.input);
        window.rr = this.renderer;
    }

    , data() {
        return {
            carets: []
        }
    }

    , methods: {
        setText(v) {
            this.renderer.setText(v)
        }
    }
})



var mdWriter = new Vue({
    data: {
    }

    , mounted(){
        L('mounted writer')
    }

    , methods: {
        refs(){
            return markdownApp.$refs
        }

        , set1(){
            let rr = this.refs().m1.renderer;
            rr.setText('I like cake')
        }
    }
})

window.writer = mdWriter

})();

