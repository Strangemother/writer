importScripts(
    `/static/js/lib/WorkerRPC.js`
    , '/static/js/marked/lib/marked.js'
    , '/static/js/vendor/highlight.pack.js'
)

var data = {}
var renderer;
var rpc;

var main = function(){
    renderer = new Renderer();
    rpc = new WorkerRPC();
    rpc.setText = setText;
    rpc.setBlocks = setBlocks;
    rpc.event = event;
}


class Renderer {
    constructor() {
        marked.setOptions({
          renderer: new marked.Renderer(),
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          highlight: function (code) {
            return hljs.highlightAuto(code).value;
          }
        });
    }

    renderLines(lines){
        return this.render(lines.join('\n'))
    }

    render(s){
        var self = this;
        return marked(s, (function(data){
            return function (err, rs) {
                if (err) throw err;
                self.rendered(rs,s);
            }
       })(data) ) ;
    }

    rendered(rStr, oStr) {
        postMessage({
            type: 'render'
            , content: rStr
        })
    }
}


var setText = function(text) {
    data.text = text
    data.lines = text.split('\n')
    return text.length
}

var setBlocks = function(blocks) {
    /* store multiple text content blocks */
    data.blocks = blocks;
}

var getLines = function(){
    return data.lines
}


var event = function(aceEvent) {

    if(data.blocks != undefined ){
        console.log('into block mode');

    };

    if(data.text == undefined) {

        return { request: 'text', success: false }
    }

    let text = data.text.length;
    let result = {
        success: true
        , lines: aceEvent.lines
        , start: aceEvent.start
        , end: aceEvent.end
        , action: aceEvent.action
    };

    let lines = data.lines
        , startRowVal = aceEvent.start.row
        , endRowVal   = aceEvent.end.row
        , startColVal = aceEvent.start.column
        , endColVal   = aceEvent.end.column
        , startRow    = lines[startRowVal]
        , endRow      = lines[endRowVal]
        ;

    if(aceEvent.action == 'remove') {

        if(startRowVal == endRowVal) {
            let endLine = lines[endRowVal];
            result.text = endLine.slice(startColVal, endColVal);
            let startSlice = endLine.slice(0, startColVal)
            let endSlice = endLine.slice(startColVal + result.text.length);
            data.lines[endRowVal] = startSlice + endSlice;
        } else {

            let selectedLines = data.lines.splice(startRowVal, endRowVal - startRowVal + 1)
                , startKeep   = selectedLines[0].slice(0, startColVal)
                , lastOf      = selectedLines[selectedLines.length-1]
                , endKeep     = lastOf.slice(endColVal, lastOf.length)
                , repLine     = startKeep + endKeep
                ;

            var spl = data.lines.splice(startRowVal, 0, repLine)
            result.text =  data.lines.join('\n');
        }

    }else if(aceEvent.action == 'insert') {

        if(startRowVal == endRowVal) {
            for (var i = 0; i < aceEvent.lines.length; i++) {
                let line = aceEvent.lines[i];
                let first = lines[endRowVal].slice(0, startColVal);
                let last = lines[endRowVal].slice(startColVal);
                data.lines[startRowVal] = first + line + last
            }

        } else {
            let startLine = lines[startRowVal]
                , startKeep = startLine.slice(0, startColVal)
                , endKeep = startLine.slice(startColVal)
                ;

            let _lines = [
                // Lines before the selection
                lines.slice(0, startRowVal)
                // line (before) insert + first line of the insert lines
                , [startKeep + aceEvent.lines[0]]
                // All new lines within first and last
                , aceEvent.lines.slice(1, aceEvent.lines.length-1)
                // last line of insert lines + line (after) insertion
                , [aceEvent.lines[aceEvent.lines.length-1] + endKeep]
                // all lines after insert line
                , lines.slice(startRowVal + 1)
            ];

            let _result = [];
            for(let _line of _lines) {
                _result = _result.concat(_line)
            }

            data.lines = _result;
        }

        // Detect enter Key
        if( startRowVal + 1 == endRowVal
            && aceEvent.lines.length == 2
            && aceEvent.lines[0] == '' && aceEvent.lines[1] == '') {
                let line = lines[startRowVal]
                let r = [line.slice(0, startColVal), line.slice(startColVal)]
                lines[startRowVal] = r[0]
                lines.splice(startRowVal + 1, 0, r[1])
            };
    } else {
        console.log('nothing with', aceEvent.action)
    }

    renderer.renderLines(data.lines);
    return result;
}

;main();
