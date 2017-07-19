(function(){

importScripts(
    `/static/js/WorkerRPC.js`
)

console.log('new render-worker');

var rpc
var main = function(){
    rpc = new WorkerRPC();
    rpc.render = render
    rpc.event = event
}

var render = function(d){
    /* render the text */
    console.log('render', d)
}

var event = function(d){
    console.log('render-worker', d.owner, d)
}

;main();

})()
