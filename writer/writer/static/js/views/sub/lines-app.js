/* Render the thread worker 'lines' - session-worker text. */
let linesApp = new Vue({
    el: '#line-view'
    , data: {
        lines: []
    }
    , created(){
        //console.log('send log attach')

        bus.$on('data-connection', function(){
            bus.$emit('log-attach', { logUpdate: this.logHandle.bind(this) })
        }.bind(this))
    }
    , methods: {
        logHandle(){
            let rpc = dataConnection.rpc;
            rpc.get('getLines', {}, function(d){
                this.lines = d
            }.bind(this))
        }
    }

})
