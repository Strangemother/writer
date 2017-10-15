class ThreadsRPC {
    constructor(hooked_renderers){
        this.config = {}
        this.hooked_renderers = hooked_renderers
        this.onReadyCallbacks = []

    }

    _makeRPC(path, readyCallback) {

        let p = path;
        let self = this;
        let config = this.config;

        let rpc = new WorkerRPC(p, function(){

            if(readyCallback){ readyCallback(rpc, p) };

            for (var i = 0; i < self.onReadyCallbacks.length; i++) {
                self.onReadyCallbacks[i](self.rpc);
            }

        }, function(e){
            let fn = `${e.data.type}WorkerMessage`;

            if(self.hooked_renderers == undefined) {
                console.warn('message too early.')
                return
            }

            if(config.renderers != undefined) {

                for (var i = config.renderers.length - 1; i >= 0; i--) {
                    if(config.renderers[i][fn] != undefined) {
                        config.renderers[i][fn](e)
                    }
                }
            }

            if(self.hooked_renderers[fn] != undefined) {
                self.hooked_renderers[fn](e)
            }

        });

        //console.log('making rpc, collecting _logCallbacks', this._logCallbacks)
        //for (var i = 0; i < this._logCallbacks.length; i++) {
        //    let item = this._logCallbacks[i];
        //    this.addLogCallback(item, rpc);
        //};
        //this._logCallbacks

        return rpc;
    }

    makeRPC(workerPath, clientPaths) {
        /* Geenerate a new RPC */
        this._clientPaths = clientPaths
        this._workerPath = workerPath;

        return this.rpc = this._makeRPC(workerPath, this.workerReady.bind(this))
    }

    workerReady(rpc, path) {
        //console.log('worker manager ready')
        for (var i = 0; i < this._clientPaths.length; i++) {
            rpc.addWorker(this._clientPaths[i])
        }
    }
}
