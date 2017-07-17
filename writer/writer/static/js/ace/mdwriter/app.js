;(function(){
    'set strict'

var log = function(){
    return console.log.apply(console, arguments)
};

var html = $('#writer_template').remove().html();
Vue.component('markdown-editor', {
    template: html
})

var mdWriter = new Vue({

    data: {

    }

    , mounted(){
        log('mounted writer')
    }

    , methods: {

    }
})

window.writer = mdWriter

})();

