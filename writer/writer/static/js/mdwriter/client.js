/* A worker client.*/

L('client.js')

var clientWorker = function(workerPath, renderer) {
    var onReadyCallbacks = []
    var renderer;

    var rpc = new WorkerRPC(workerPath, function(){
        for (var i = 0; i < onReadyCallbacks.length; i++) {
            onReadyCallbacks[i](rpc)
        }
    }, function(e){
        let fn = `${e.data.type}WorkerMessage`;

        if(renderer[fn] != undefined) {
            renderer[fn](e)
        }
    });

    return [onReadyCallbacks, rpc];
}
