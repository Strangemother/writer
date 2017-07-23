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

    init(){

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

    static mount(){
        /* Start the `this` worker, implementing the instance
        into the mounted clients.*/
        self.manager.mountClient(this)
    }

    _mount(manager) {
        /* Called at instance time by the manager, given the manager
        instance mounted into.*/
        this._init()
        console.log('I am mounted')
        this.mounted()
    }

    mounted(){
        /* class is mounted and ready for use.*/
    }

    _init(){
        this._methodCache = this.getMethods()
        self.manager.clients.push(this)
    }

    receiveEvent(e) {
        let ename = e.name;
        if(ename in this._methodCache) {
            return [true, this._methodCache[ename](e)]
        }

        return [false, undefined];
    }

    mountMethods() {
        /* return an object of name:method for to implement into the RPC.*/
        return {}
    }
}

