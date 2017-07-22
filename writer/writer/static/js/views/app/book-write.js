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

class BookWriter {

    constructor(){

        this.initEvents()
        console.log('book writer')
    }

    initEvents(){
        bus.$on('renderer-event', this.rendererEvent.bind(this))
    }

    rendererEvent(e) {
        console.log('renderer')
        // this._rpc(e)
    }

    _rpc(){
        if(rpc._ready) {
            bus.$emit('renderer-event', { content, callback: cb });
            var p = rpc.event(content, this.eventReply.bind(this))
        } else{
            if(this._waiting == undefined) {
                this._waiting = []
            };
            this._waiting.push([content, cb])
        }
    }
}

;main();

})()
