/*
The worker manager is the first to be improted by the rpc requesting app.
The manager will spawn additional addons to facilitate worker loading
for a given app request.
Each extension to the manager becomes an rpc function.
 */

class ManagerClientClass {
    /* API extend point for mounting clients into the manager.
    Call static ManagerClientClass.mount() to append the class to
    the manager mounted clients.
    RPC functionality for the `method()` call the mounted class instance.
    */
    constructor(manager){
        this._manager = manager;
        this._handlers = {}
        this.init()
    }

    init(){}

    getRPC(){
        return this._manager.rpc;
    }

    methodOnRPC(name, func) {
        return this.getRPC().setMethod(name, func)
    }

    getMethods(){
        /* returns an object of name:method to implement into the RPC.
        functions of the same name are called in sequence, ordering is
        default*/
        return Object.assign({
            response: this._response
        }, this.mountMethods())
    }

    _response(){
        return 'howdy'
    }

   _mount(manager) {
        /* Called at instance time by the manager, given the manager
        instance mounted into.*/
        this._init()
        // console.log('I am mounted')
        this.mounted()
    }

    _destroy() {
        this.unmount()
    }

    _init(){
        this._methodCache = this.getMethods()
        self.manager.clients.push(this)
    }

    _receiveEvent(e) {
        let ename = e.name;
        let result = [false, undefined];

        if(ename in this._methodCache) {
            result = [true, this._methodCache[ename](e)]
        }

        let name = `${ename}Event`;

        if(this[name]) {
            result = [true, this[name](e)]
        }

        let handlers = this._handlers['_ANY_'] || []
        for (var i = 0; i < handlers.length; i++) {
            handlers[i](e)
        };

        handlers = this._handlers[name] || []

        for (var i = 0; i < handlers.length; i++) {
            handlers[i](e)
        }

        return result;
    }

    onEvent(name, callback) {
        if(callback == undefined
            && IT.g(name).is('function') ) {
            callback = name;
            name = undefined;
        };

        if(name == undefined) {
            name = '_ANY_'
        }

        if(this._handlers[name] == undefined) {
            this._handlers[name] = []
        }

        this._handlers[name].push(callback)
    }

    mounted(){
        /* class is mounted and ready for use.*/
    }

    unmount() {}

    static mount(name){
        /* Start the `this` worker, implementing the instance
        into the mounted clients.*/
        self.manager.mountClient(this, name)
    }

    mountMethods() {
        /* return an object of name:method for to implement into the RPC.*/
        return {}
    }

    aLog(key, data) {

        postMessage({
            name: 'logUpdate'
            , type: key
            , content: data
            , level: 1
        })
    }

    bLog(key, data) {
        this.aLog(key, Object.assign(data, { level: 2 }))
    }

    eLog(errStr) {
        this.aLog('error', Object.assign({ errStr }, { level: 'error' }))
    }

    emit(k, d){

        this.aLog(k, d)
        this._receiveEvent(Object.assign({name: k}, d))
    }
}

