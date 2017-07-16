let p ='/static/js/markdown-worker.js';
var onReadyCallbacks = []
var renderer;

var rpc = new WorkerRPC(p, function(){
    for (var i = 0; i < onReadyCallbacks.length; i++) {
        onReadyCallbacks[i](rpc)
    }
}, function(e){
    let fn = `${e.data.type}WorkerMessage`;

    if(renderer[fn] != undefined) {
        renderer[fn](e)
    }
});


class AceRender {
    styles() {
        return {
            fontSize: "18px"
        }
    }

    constructor(editorName, contentName){
        this.editor = this.makeEditor(editorName)
        onReadyCallbacks.push(this.sendWaiting.bind(this))

        if(contentName != undefined) {
            this.outputNode = document.getElementById(contentName)
            let t = this.outputNode.innerHTML;
            this.setText(t, this.editor);
        }
    }

    setText(htmlText, editor) {
        editor = editor == undefined? this.editor: editor;
        editor.setValue(htmlText)


        if(rpc._ready == false) return;

        rpc.setText(htmlText, function(d){
            console.log('worker setText said:', d)
        })
        // this.outputNode.innerHTML = this.outputNode.innerHTML;

    }

    getText(){
        return this.editor.getValue()
    }

    makeEditor(IDhtml) {

        let change = (function(p, editor) {
            return function(e){
                p.editorChangeEvent(editor, e)
            }
        })(this, editor)

        var editor = ace.edit(IDhtml);

        editor.setTheme("ace/theme/monokai");
        let session = editor.getSession();
        session.setMode("ace/mode/markdown");

        let styles = this.styles();
        for(let name in styles) {

            editor.container.style[name] = styles[name];
        }

        session.on('change', change)

        return editor;
    }

    sendWaiting() {
        for (var i = 0; i < this._waiting.length; i++) {
            this.send(this._waiting[i][0], this._waiting[i][1])
        }
    }

    renderWorkerMessage(e) {
        this.outputNode.innerHTML = String(e.data.content)
    }

    editorChangeEvent(editor, aceEvent) {
        /* read the value from the event and
        apply the content to the view.*/
        let event = aceEvent.action
        let fn = `${event}AceRender`;

        this.send(aceEvent)
        if(this[fn] != undefined){
            this[fn](editor, aceEvent);
        } else {
            console.log(event, aceEvent)
        }
    }

    send(content, cb) {

        if(rpc._ready) {
            var p = rpc.event(content, this.eventReply.bind(this))
        } else{
            if(this._waiting == undefined) {
                this._waiting = []
            };
            this._waiting.push([content, cb])
        }
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

    textHandleEvent(d) {
        rpc.setText(this.getText(), this.eventReply.bind(this))
    }

    insertAceRender(editor, ev) {
        this._insertToEditor(editor, ev)
    }

    removeAceRender(editor, ev) {
        let lines = this.outputNode.innerHTML.split('\n');
        let startRow = lines[ev.start.row];
        let endRow = lines[ev.end.row];
        let selected;

        if(ev.start.row == ev.end.row) {
            selected = lines[ev.end.row].slice(ev.start.column, ev.end.column)
        } else {
            let selectedLines = lines.slice(ev.start.row, ev.end.row+1)
            selectedLines[0] = selectedLines[0].slice(ev.start.column, selectedLines[0].length)
            selectedLines[selectedLines.length-1] = selectedLines[selectedLines.length-1].slice(0, ev.end.column)
            selected = selectedLines.join('\n')

        }

        console.log('editor: Deleted:', selected);
    }

    _insertToEditor(editor, ev) {
        console.log('insert event', ev)
    }

}

(function(){
    //renderer = new AceRender('markdown_editor', 'markdown_content')
})()
