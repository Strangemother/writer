/*

Manage content throughput for the entire application:

    + Menu events
    + Editor events
    + Render changes

 */

var bookWriteConfig = {
    managerWorker: '/static/js/views/workers/manager.js'
    , managerClients: [
        // Text typing tracking
        '/static/js/mdwriter/workers/session-worker.js'
        // html renderer
        , '/static/js/mdwriter/workers/render-worker.js'
        // Text to page blocks conversion
        , '/static/js/mdwriter/workers/page-worker.js'
    ]
}

;(function(){


var main = function() {
    bus.bookWriter = new BookWriter(bookWriteConfig);
}


class WorkerManager {
    /*
    setup and communicate to the worker
    */

    constructor(config={}){
        this.onReadyCallbacks = []
        this.hooked_renderer = {};
        this.config = config;
        this.init()
    }

    init(){
        /* Geenerate a new RPC */
        let path = this.config.managerWorker;
        this.rpc = dataConnection.makeRPC(path, this.config.managerClients)
    }
}


class EditorManager extends WorkerManager {
    /*
        handle thr throughput of the editor panel.
    */
    init(){
        super.init()
        this.initEvents()
    }

    initEvents(){
        bus.$on('renderer-event', this.rendererEvent.bind(this))
    }

    rendererEvent(e) {
        this.rpc.event(e.content, e.callback)
    }

}

class BookWriter extends EditorManager {

    init(){
        super.init()
        bus.bookWriter = this;

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
