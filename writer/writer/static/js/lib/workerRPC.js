/* RPC style calling to a web worker

* A RPC should be easy to setup each side
* RPC in worker should not affect standards
* Worker should work normally (under-the-hood) to bypass api

It's named a Worker RPC (rather than RPC Worker) for explicit understanding
of the class tool.

To use a script; within your app:

    var worker = new WorkerRPC(path[, callback])

Within the worker, define a RPC

    exports = { foo: function(v){ return `${v} apples`; } }
    var rpc = new WorkerRPC(exports<{}>)

Using the worker through RPC defined calls

    callback = function(v){
            log(v) // bad apples
        }

    worker.foo('bad', callback)

args edit:

    // Pass any args, omiting callback last arg
    rpcCall = worker.foo('bad', 1, false, undefined)
    // late apply a callback. If request is complete, it calls immediately.
    rpcCall.callback(function)
    rpcCall.id
    // true/false return with callback provider.
    rpcCall.error(function)
    rpcCall.done == false

*/

var _id = function(){
    return ( (Math.random() + +(new Date) )).toString(14)
};

var log = function(...args){
    //console.log.apply(console, args)
}
var rpcs = []
var itPath = '/static/js/lib/IT.js';

var rpc_onmessage = function(e){
    log('rpc_onmessage')
    for (var i = rpcs.length - 1; i >= 0; i--) {
        rpcs[i].receive(e)
    }
}

class BaseRPC {

    constructor(path, callback, onMessage) {
        if( IT.g(path).is('function')
            && callback == undefined
            && onMessage == undefined ) {
            onMessage = path;
            path = undefined
        }
        this.path = path
        this.readyCallback = callback || function(){};
        this.callback = onMessage == undefined? function(){}: onMessage;

        // Push to stack, allowing many RPC in Worker
        rpcs.push(this)
    }

    log(){
        var s, n

        if(this.path === undefined ) {
            s = '%c worker '
            n = [s, 'background: #EEE; color: #A72929']
        } else {
            s = '%c client '
            n = [s, 'background: #EEE; color: #448AFF']
        };

        //n = [s, 'background: #222; color: #448AFF']

        for (var i = 0; i < arguments.length; i++) {
            n.push(arguments[i])
        };
        log.apply(console, n)
    }
}

class WorkerPromise {
    /* Given back by a long running RPC process,
    The caller will wait until .done().
    _done and data are given after function return.*/
    constructor(){
        this.data = undefined

    }

    log(){
        var s = '%c promise ';
        var n = [s, 'background: #DDD; color: #5B30A0'];
        for (var i = 0; i < arguments.length; i++) {
            n.push(arguments[i])
        };

        console.log.apply(console, n)
    }

    done(){
        /* called when the user finishes the API work. Provide
        the data to give back to the response. */
        this.log('Done callback', arguments)
        this._done(this.data, arguments)
    }

    _done(data, value) {
        /*placeholder for override of the done handler.*/
    }

    error(){
        // Callback for error response.
    }
}

class PromiseRPC extends BaseRPC {
    /* A Promise can provide a simple caller for
    long running callbacks of the RPC of which cannot
    return data immediately.

    Return a promise - When the task is complete, provide
    the promise content to the given handler. */

    promise(){
        /* generate and return a new promise. Later to be
        called with completed data*/
        var p = new WorkerPromise()
        return p
    }
}


class ClientRPC extends PromiseRPC {
    constructor(path, callback, onMessage) {
        super(path, callback, onMessage)
        this._get = {}
        if( this.path !== undefined
            && IT.g(this.path).is('string') ) {
            this.start()
        }
    }

    start(config) {
        /*
         Build the worker unit (client context)
         */
        this.log('start', this.path);
        this.worker = new Worker(this.path);
        var self = this;
        this.worker.onmessage = function(e){
            // console.log('message', e)
            self.receive.call(self, e);
        }

        this.log('>> activate')
        // Worker request
        this.get('activate', [config], this.activeCallback.bind(this))
    }

    activeCallback(data, event) {
        /* Callback for the activate call from start()
        data are methods allowed through the rpc api.
        ref defines the original request to the rpc call */
        this.log('<< activeCallback', data)
        this.addCalls(data)
    }

    addCalls(list) {
        /* Add a list of callers to the class. When a function
        is called the RPC raps the caller returning a pseudo
        promise and enacting the call. */
        for (var i = 0; i < list.length; i++) {
            this.log('Writing RPC Caller:', list[i])
            this[list[i]] = (function(name){
                var f = function rpcCaller(args, func){

                    return this.get(name, args, func || this.getCallback)
                };
                f.bind(this);
                return f;
            })(list[i])
        }
    }

    get(name, args, callback) {
        /* perform a call to a RPC function of the given name.
        all arguments provided are given to the pipe request.
        Returned is a get object, to read and provide additional
        values.*/

        /* get and apply a function to call when the
        promise resolves. */
        var callbackFunc = this.getCallback
        var pack = this._pack(name, args);
        var v = this.post(pack);

        this.log('performing get', name, this._get);

        var r = {
            callback: callbackFunc
            , _callback: callback
            , name: pack.name
            , id: pack.id
            , _post: pack

        }

        this._get[pack.id] = r;
        return r
    }

    getCallback(f) {
        if(f !== undefined) {
            this._callback = f
        }

        return this._callback;
    }
}

class WorkerRPC extends ClientRPC {

    constructor(path, callback, onMessage) {

        if(self['importScripts'] !== undefined ){
            self['importScripts'](itPath)
        }

        var it  = IT.g;
        super(path, callback, onMessage);

        if(arguments.length == 1 && IT.g(path).is('object') ) {
            this.proxy = this.rpcProxy(path);
            return this.proxy;
        };

        this._methods = [];
        this._ready = false;

        this.proxy = undefined

        if( this.path === undefined
            && callback === undefined ) {
            this.proxy = this.rpcProxy()
            return this.proxy;
        }
    }

    receive(e){
        /* Receive a message from the worker */
        console.log('RECEIVE', e.data.name, e.data.id);
        var m = this.getMethods();
        this.log('methods:', m, this.proxy);

        var v
            , g
            , cb = this.callback
            ;

        if(cb !== undefined) {
            cb(e)
        }

        var proxied = false;
        // Worker Proxy - Call User defined method.
        if(this.proxy && e.data.name in this._callers) {
            /* Worker client will have been filled with
            functions to call.*/
            this.log(e.data.name, 'found in proxy')
            v = this._callers[e.data.name](e.data.content);
            if(v instanceof(WorkerPromise)) {
                this.log('Promise returned, setting wait.')
                v.data = e.data
                v._done = this.reply.bind(this)
            } else {
                this.reply(e.data, v)
            }
            proxied = true;
        }

        // Perform any exact ID waiting functions
        if(this._get[e.data.id] !== undefined) {
            g = this._get[e.data.id];
            delete this._get[e.data.id];

            log('Found callback:', g, g.id);

            var cb = g.callback()
            if(e.data.name == 'reply') {
                // data is nested in the reply function.
                try {
                    cb && cb.call && cb.call(this, e.data.content.content, e)
                } catch(error){
                    console.error('Worker Error', error)
                    cb && cb(this, e.data.content.content, e)
                }

            } else {
                cb.call(this, e.data.content, e)
            }
        }


        // Perform call on class.
        if( (this[e.data.name] !== undefined)
            && (proxied == false)) {

            this.log('Found class RPC:', e.data.name)
            if(this.worker === undefined) {
                v = this[e.data.name](e.data.content);
            }else {
                this.log('Will not call', e.data.name
                    , 'because not in rpc mode.')
            }

            if(v !== undefined) {
                this.reply(e.data, v)
            }
        } else if(proxied == false){
            console.log('Did not find function', e.data.name)

        }

        if(this._ready == false) {
            this._ready = true;
            this.readyCallback.apply(this, [e])
        };

        if(this._methods[e.data.name] != undefined) {
            this._methods[e.data.name](e.data, e)
        }
    }

    activate(config) {
        /*activate this worker (requested by client) and
        post back the available methods */
        this.log('ACTIVATE')
        var methods = this.methods()
        return methods
    }


    rpcProxy(config) {
        this.log('Creating RPC Proxy')
        this._callers = {}
        var _self = this;

        var p = new Proxy(this, {
            set: function(obj, prop, value){
                return _self.setMethod(prop, value);
            }
        });

        self.onmessage = rpc_onmessage
        return p;
    }

    setMethod(name, func){
        this.log('RPC Set:', name);

        if(this._callers == undefined) {
            // client side addition.
            this._methods[name] = func;
            return true;
        };

        this._callers[name] = func;
        return true;
    }

    methods() {
        /* return all the methods applied to the worker RPC through
        the path instance.
        This should work for both worker and client.

        Returns is a list of strings for callable values to the
        worker.*/

        // Request worker
        if(this.worker) {
        } else {
            var d =  this.getMethods()
            this.log('Returning methods list', d);
            return d;
        }
    }

    getMethods(){
        /*

         */
        if(this._callers == undefined) {
            this.log('No callers in this._callers')
            return []
        };

        return Object.keys(this._callers);
    }

    send(name, data) {
        /*send a message to worker*/
        var pack = this._pack(name, data)
        var v = this.post(pack);
        pack.post = v;
        return pack;
    }

    _pack(name, data, id) {
        var pack = {
            name: name
            , content: data
            , id: id || _id()
        }

        return pack
    }

    post(pack){
        var v;
        this.log('POST', pack.name)
        if(this.worker) {
            /* Client context, sending a message to the worker.*/
            v = this.worker.postMessage(pack);
            return v;
        } else if(self.postMessage !== undefined ) {
            v = self.postMessage(pack);
        }

        return v;
    }

    reply(data, v) {
        /* send data back to the callier (worker to client)
        after a method has been called from the RPC API.
        data is the original call complete with function name
        and ID created. V or value is the return from the function
        call. */
        data.content = v
        var pack = this._pack('reply', data, data.id)

        return this.post(pack)
    }
}

