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
        if(ename in this._methodCache) {
            return [true, this._methodCache[ename](e)]
        }

        let name = `${ename}Event`;
        if(this[name]) {
            return [true, this[name](e)]
        }

        return [false, undefined];
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
}

