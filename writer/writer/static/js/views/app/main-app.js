/*

Manage content throughput for the entire application:

    + Menu events
    + Editor events
    + Render changes

 */

var bookWriteConfig = {
    // Manager worker file. The main script to boot
    managerWorker: '/static/js/views/workers/manager.js'
    , managerClients: [
        // Text typing tracking
        '/static/js/mdwriter/workers/session-worker.js'
        // html renderer
        // , '/static/js/mdwriter/workers/render-worker.js'
        // Text to page blocks conversion
        // , '/static/js/mdwriter/workers/page-worker.js'
    ]
}


;(function(){


var main = function() {
    bus.bookWriter = new BookWriter(bookWriteConfig);

}


class BookWriter {
    /*
    setup and communicate to the worker
    */

    constructor(config={}){
        this.onReadyCallbacks = []
        this.hooked_renderers = {};
        this.config = config;
        bus.bookWriter = this;
        this.init()
    }

    init(){
        /* Geenerate a new RPC */
        this.initThreads()
        this.initEvents()
    }

    initThreads(){
        let path = this.config.managerWorker;
        this.threads = new ThreadsRPC(this.hooked_renderers)
        this.rpc = this.threads.makeRPC(path, this.config.managerClients)
    }

    initEvents(){
        bus.$on('renderer-event', this.rendererEvent.bind(this))
        bus.$on('text', this.textEvent.bind(this))
    }

    rendererEvent(e) {
        this._sendRPC(e.content, e.callback)
    }

    _sendRPC(content, callback){
        if(this.rpc.event) {
            this.rpc.event(content, callback)
        } else {
            console.log('no rpc')
        }
    }

    textEvent(e){
        console.log(e)
        this._sendRPC(e, this.textEventCallback)
    }

    textEventCallback(e){
        console.log('textEventCallback', e)
    }

    eventReply(data) {
        if(data.success == false){
            return this.handleEventError(data)
        };

        for (var i = this.callbacks.length - 1; i >= 0; i--) {
            this.callbacks[i](data)
        }
    }

    handleEventError(d){
        console.log('handle error', d)
        let fn = `${d.request}HandleEvent`
        if(this[fn] != undefined) {
            this[fn](d)
        }
    }

}

;main();

})()
