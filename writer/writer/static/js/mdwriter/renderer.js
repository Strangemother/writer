/* A base class for all renderers to communicate to the worker.
v2
*/

(function(){

L('renderer.js')

var rpc = new WorkerRPC();

var workerRenderer = {
    testWorkerMessage: function(e){
        /* called if the worker send 'test' */
        console.log('TestEvent', e);
    }
};

/* build a client worker and bind messages to a function set or
the worker renderer.*/
var onReadyCallbacks = clientWorker('/static/js/mdWriter/workers/render-worker.js', workerRenderer);


class WorkerBase {
    /* Communicate to the singleton callback. */

    constructor(editorName, contentName){
        onReadyCallbacks.push(this.sendWaiting.bind(this))
        this._waiting = []
        this.init.apply(this, arguments)
    }

    init(){

    }

    getWorker(){
        return rpc
    }

    sendWaiting() {
        for (var i = 0; i < this._waiting.length; i++) {
            this.send(this._waiting[i][0], this._waiting[i][1])
        }
    }

    send(content, cb) {
        let rpc = this.getWorker();

        if(rpc._ready) {
            var p = rpc.event(content, this.eventReply.bind(this))
        } else{
            if(this._waiting == undefined) {
                this._waiting = []
            };
            this._waiting.push([content, cb])
        }
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


class Renderer extends WorkerBase {
    init(entity){
        /* Init with a given entity.*/
        console.log('new renderer', entity)
        //this.send('hello')
        this.editor = this.makeEditor(entity)
    }

    styles() {
        return {
            fontSize: "18px"
        }
    }

    setText(htmlText, editor) {
        console.log('setText', htmlText)
    }

    getText(){}

    getNodeByString(value) {
        // return a html node with the given value
        entity = document.getElementById(entity)
    }

    makeEditor(entity) {

        if(IT.g(entity).is('string') ) {
            entity = this.getNodeByString(entity)
        };

        L('makeEditor', entity)

        let instance = this.setup(entity);
    }

    setup(htmlNode){
        L('setup instance', htmlNode)
        this.instance = new InputInstance(htmlNode);
        this.instance.initRender()
        this._setup = true;
    }

    destroy(){
        L('destory instance')
        this.instance.destroy()
        this._setup = false;
    }
}

class InputInstance {

    constructor(node, config) {
        this.cloneAndReplace(node);
        this.config = config

        this.inputNode = undefined;
    }

    cloneAndReplace(node){
        /* replicate the given node and replace the view instance.*/
        this.replaceInputNode(node);
    }

    replaceInputNode(replaceNode){
        /* replace the view node with the given node as an instance.*/
        let existing;
        let options = this.getInputNodeOptions(replaceNode)
        let newInputNode = this.createInputNode(options)
        debugger;
    }

    getInputNodeOptions(existingNode) {
        /* return an object of config for the input node,
        copying information from existing node if required. */
        let id = existingNode? existingNode.id: this.randomId();
        let defaultClasses = 'input-view input-node';
        let classes = existingNode? existingNode.classList.value: defaultClasses
        let o = {
            id: id
            , classes: classes
        }

        return o;
    }

    createInputNode(options){
        let nodeType = 'div';

        let defOptions = {
            id: this.randomId()
            , type: 'div'
        }

        let config = Object.assign(defOptions, options);
        nodeType = defOptions.type || nodeType;
        delete config.type;

        return $(`<${nodeType}/>`, config)
    }

    randomId(){
        return this.inputNodePrefix() + '_' + (Math.random().toString(32).slice(2))
    }

    inputNodePrefix(){
        return 'input_node'
    }

    removeInputNode() {
        /* remove the current input node from the screen and return*/
        this.inputNode.remove()
        return this.inputNode
    }

    initRender(){
        /* Render; assuming the first time*/
        debugger
    }

    destory(){

    }
}

window.Renderer = Renderer

})()
