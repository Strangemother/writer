/* A rebuild of markdown-editor
with the new editpr.
*/

let p ='/static/js/markdown-worker.js';
var onReadyCallbacks = []
var renderer;

var rpc = new WorkerRPC(p, function(){
    for (var i = 0; i < onReadyCallbacks.length; i++) {
        onReadyCallbacks[i](rpc)
    }
}, function(e){
    let fn = `${e.data.type}WorkerMessage`;

    if(renderer[fn] != undefined) {
        renderer[fn](e)
    }
});


class Renderer {
    styles() {
        return {
            fontSize: "18px"
        }
    }

    constructor(editorName, contentName){
        this.editor = this.makeEditor(editorName)
        onReadyCallbacks.push(this.sendWaiting.bind(this))

    }

    setText(htmlText, editor) {
        outputNode.innerHTML = this.outputNode.innerHTML;

    }

    getText(){}

    makeEditor(IDhtml) {
    }

    sendWaiting() {
        for (var i = 0; i < this._waiting.length; i++) {
            this.send(this._waiting[i][0], this._waiting[i][1])
        }
    }

    send(content, cb) {

        if(rpc._ready) {
            var p = rpc.event(content, this.eventReply.bind(this))
        } else{
            if(this._waiting == undefined) {
                this._waiting = []
            };
            this._waiting.push([content, cb])
        }
    }


    renderWorkerMessage(e) {
        this.outputNode.innerHTML = String(e.data.content)
    }

    eventReply(data) {


        if(data.success == false){
            return this.handleEventError(data)
        };

        console.log('RPC Said:', data)
    }

    handleEventError(d){
        console.log('handle error')
        let fn = `${d.request}HandleEvent`
        if(this[fn] != undefined) {
            this[fn](d)
        }
    }

}

(function(){
    //renderer = new AceRender('markdown_editor', 'markdown_content')
})()
