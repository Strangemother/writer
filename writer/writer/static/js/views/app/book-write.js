/*

Manage content throughput for the entire application:

    + Menu events
    + Editor events
    + Render changes

 */

;(function(){

var main = function() {
    bus.bookWriter = new BookWriter();
}


class WorkerManager {
    /*
    setup and communicate to the worker
    */


    constructor(){
        this.onReadyCallbacks = []
        this.hooked_renderer = {};
        this.config = {};
        console.log('book writer')
        this.init()
    }

    init(){
        /* Geenerate a new RPC */
        let path = '/static/js/views/workers/manager.js';
        this.rpc = dataConnection.makeRPC(path, this.workerReady.bind(this))
    }

    workerReady(rpc, path) {
        console.log('worker manager ready')
        rpc.addWorker('/static/js/mdwriter/workers/render-worker.js')
    }

}

class WriterBase extends WorkerManager {
}


class EditorManager extends WriterBase {
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

        // console.log('RPC Said:', data)
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
