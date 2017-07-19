/* A base class for all renderers to communicate to the worker.
*/

(function(){

L('renderer.js')

// var rpc = new WorkerRPC();

var workerRenderer = {
    testWorkerMessage: function(e){
        /* called if the worker send 'test' */
        console.log('TestEvent', e);
    }
};

/* build a client worker and bind messages to a function set or
the worker renderer.*/
var [onReadyCallbacks, rpc] = clientWorker('/static/js/mdWriter/workers/render-worker.js', workerRenderer);

var _queue = [];
var _prepped = false;

var sendQueue = function() {
    if(rpc._ready == false) {
        if(!_prepped) {
            _prepped = true;
            onReadyCallbacks.push(queueStart);
        }
        _queue.push(arguments);
    } else {
        rpc.send.apply(rpc, arguments);
    }
};

var queueStart = function(){
    console.log('queueStart')
    for (var i = _queue.length - 1; i >= 0; i--) {
        rpc.send.apply(rpc, _queue[i]);
    }

    _queue = [];
}

window.sq = sendQueue

sendQueue('event', 'Apples')

class WorkerBase {
    /* Communicate to the singleton callback. */

    constructor(editorName, contentName){
        this._waiting = []
        this._init.apply(this, arguments)
    }

    _init(){}

    getWorker(){
        return rpc
    }

    send(content, cb) {
        // let rpc = this.getWorker();

        //debugger
        sendQueue('event', content, this.eventReply.bind(this))
        //if(rpc._ready) {
        //    var p = rpc.event(content, this.eventReply.bind(this))
        //} else{
        //    if(this._waiting == undefined) {
        //        this._waiting = []
        //    };
        //    this._waiting.push([content, cb])
        //}
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
    _init(entity){
        /* Init with a given entity.*/
        console.log('new renderer', entity)
        //this.send('hello')
        this.editor = this.makeEditor(entity)
    }

    makeEditor(entity) {

        if(IT.g(entity).is('string') ) {
            entity = this.getNodeByString(entity)
        };

        L('makeEditor', entity)

        let instance = this.setup(entity);
    }

    getNodeByString(value) {
        // return a html node with the given value
        entity = document.getElementById(entity)
    }

    setup(htmlNode){
        L('setup instance', htmlNode)
        this.instance = new InputInstance(htmlNode);
        this.instance.init()
        this._setup = true;
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

    destroy(){
        L('destory instance')

        this.instance.destroy()
        this._setup = false;
    }
}

class InputInstance extends WorkerBase {

    _init(node, config) {

        if(node != undefined) {
            this.mount(node, config);
        };

        this._id = this.randomId()
        this.inputNode = node
    }

    mount(node, config){
        /* Given an input node, clone, configure and start replace
        the view node.*/
        if(config == undefined) config = {};
        this.config = config

        if(this.mountedNode != undefined) {
            console.warn('Should not mount again.')
            return false;
        }

        if(node == undefined) {
            node = this.inputNode || this.mountedNode;
        };

        let replacement = this.cloneAndReplace(node, config.node);

        // Node supplied initially. This should never change.
        this.mountedNode = node;
        this.isMounted = true;
        // Element in view; used by the instance.
        this.replacementNode = replacement;
        return replacement;
    }

    unmount(){
        delete this.mountedNode
        this.isMounted = false;
    }

    cloneAndReplace(node, options){
        /* replicate the given node and replace the view instance.*/
        return this.replaceInputNode(node, options);
    }

    replaceInputNode(replaceNode, options){
        /* replace the view node with the given node as an instance.*/
        let existing;
        let nodeOptions = this.getInputNodeOptions(replaceNode)
        let conf = Object.assign({}, options || {}, nodeOptions)
        let newInputNode = this.createInputNode(conf)
        this.insertNodeAfter(replaceNode, newInputNode)
        replaceNode.remove()
        return newInputNode;
    }

    insertNodeAfter(target, newSibling) {
        /* push a node after a target*/
        if(target.parentNode == null) {
            console.warn('Target parent is null. Target may be a memory node.')
            return false;
        };

        target.parentNode.insertBefore(newSibling, target.nextSibling)
        return true;
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
            , text: 'default text'
        }

        let config = Object.assign(defOptions, options);
        nodeType = defOptions.type || nodeType;
        delete config.type;

        return $(`<${nodeType}/>`, config)[0]
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

    init(options){
        /* Render; create the instance build-out, assuming the internal
        node is prepared.*/
        console.log('Render init')
        options = Object.assign({}, options || {}, this.config || {})
        this.viewNode = this.setup(this.replacementNode, options)
    }

    setup(initViewNode, options){
        /* Given a node to mutate, alter the inputnode with the configuration
        for view adaption. returns a ready view node.*/
        let node = initViewNode || this.replacementNode || this.inputNode;

        // Mount if the view hasn't got the view node yet.
        if(!this.isMounted) this.mount(initViewNode, options);

        this.buildView(initViewNode, options);
    }

    buildView(node, options) {
        /* create a new view on the given node with the given options.
        return is the edited node */
        console.log('buildView')
        // rpc.event('goo')
        this.send({
            type: 'build'
            , options: options
            , owner: this._id
        })
    }

    destroy(){
        this.unmount();

        if(this.replacementNode != undefined) {
            if(this.inputNode != undefined) {
                this.insertNodeAfter(this.replacementNode, this.inputNode)
            };

            this.replacementNode.remove()
        }
    }
}

window.Renderer = Renderer

})()
