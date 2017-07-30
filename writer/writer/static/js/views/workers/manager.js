/*
The worker manager is the first to be improted by the rpc requesting app.
The manager will spawn additional addons to facilitate worker loading
for a given app request.
Each extension to the manager becomes an rpc function.
 */

(function(){


importScripts(
    `/static/js/lib/WorkerRPC.js`,
    `/static/js/views/workers/client-class.js`
)


Object.defineProperty(self, 'ManagerComponent', {
    get() {
        return ManagerClientClass
    }
})

var rpc
    , manager
    ;

var main = function(){
    rpc = new WorkerRPC()
    manager = new Manager();
    self.manager = manager
    manager.bind(undefined, rpc)
}

class Manager {

    constructor(){
        this.clients = []
        this.mounted = []
        this.workers = {}
        this.init()
    }

    init(){

    }

    bind(instance, rpc) {
        /* Given an RPC object, map the this.boundMethods() to the rpc
        for api usage. the value this.rpc is applied to this instance */
        if(rpc == undefined) {
            rpc = this.rpc;
        }

        let inst = instance == undefined ? this: instance;
        let methods = inst.getMethods ? inst.getMethods() : inst.boundMethods();

        //console.log('bind' , instance, methods)
        for(let name in methods) {
            rpc.setMethod(name, methods[name].bind(inst))
        }

        this.rpc = rpc;
    }

    mountClient(cls, name) {
        /* mount an object or instance as a client of the manager
         */
        let instance = new cls(this);
        this.mounted.push(instance)
        if(name != undefined) {
            this.workers[name]= instance;
        }
        instance._mount(this)
    }

    boundMethods(){
        return {
            event: this.eventHandle
            , addWorker: this.addWorkerHandle
        }
    }

    eventHandle(event) {
        let r = []
        for (var i = 0; i < this.clients.length; i++) {
            let [success, v] = this.clients[i]._receiveEvent(event);
            if(success) {
                r.push(v);
            }
        }

        if(r.length == 0) {
            console.log('Manager receive unhandled event', event)
        }
        return r;
    }

    removeClient(client) {
        client._destroy()
        this.clients.splice(this.clients.indexOf(client), 1)
    }

    addWorkerHandle(event){
        // console.log('add handle', event)
        importScripts(event)
    }
}

;main();

})()
