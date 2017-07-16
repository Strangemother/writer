var log = function(){
    return console.log.apply(console, arguments)
}

var mdWriter = new Vue({
    el: '#page_list'
    , data: {
    }

    , mounted(){
        log('mounted writer')
    }

    , methods: {

    }
})
