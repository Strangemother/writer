importScripts(
    `/static/js/WorkerRPC.js`
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

var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};


var setText = function(text) {
    data.text = text
    data.lines = text.split('\n')
    return text.length
}

var getLines = function(){
    return data.lines
}


var event = function(aceEvent) {

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

    var lines = data.lines;
    let startRow = lines[aceEvent.start.row];
    let endRow = lines[aceEvent.end.row];
    let selected;

    if(aceEvent.action == 'remove') {

        if(aceEvent.start.row == aceEvent.end.row) {
            result.text = lines[aceEvent.end.row].slice(aceEvent.start.column, aceEvent.end.column)
            data.lines[aceEvent.end.row] = lines[aceEvent.end.row].slice(0, aceEvent.start.column)
                // + '|' + result.text + '|'
                + lines[aceEvent.end.row].slice(aceEvent.start.column + result.text.length)

        } else {
            let selectedLines = data.lines.splice(aceEvent.start.row, aceEvent.end.row - aceEvent.start.row + 1)
            let startKeep = selectedLines[0].slice(0, aceEvent.start.column)
            let endKeep = selectedLines[selectedLines.length-1].slice(aceEvent.end.column, selectedLines[selectedLines.length-1].length);
            let repLine = startKeep + endKeep;

            var spl = data.lines.splice(aceEvent.start.row, 0, repLine)
            result.text =  data.lines.join('\n');
        }

        //console.log(data.lines.join('\n'))

    }else if(aceEvent.action == 'insert') {

        if(aceEvent.start.row == aceEvent.end.row) {
            for (var i = 0; i < aceEvent.lines.length; i++) {
                let line = aceEvent.lines[i];
                let first = lines[aceEvent.end.row].slice(0, aceEvent.start.column);
                let last = lines[aceEvent.end.row].slice(aceEvent.start.column);
                data.lines[aceEvent.start.row] = first + line + last
            }
        } else {
            // console.log('Multirow insert')
            let startLine = lines[aceEvent.start.row]
                , startKeep = startLine.slice(0, aceEvent.start.column)
                , endKeep = startLine.slice(aceEvent.start.column)
                ;
            let _lines = [
                // Lines before the selection
                lines.slice(0, aceEvent.start.row)
                // line (before) insert + first line of the insert lines
                , [startKeep + aceEvent.lines[0]]
                // All new lines within first and last
                , aceEvent.lines.slice(1, aceEvent.lines.length-1)
                // last line of insert lines + line (after) insertion
                , [aceEvent.lines[aceEvent.lines.length-1] + endKeep]
                // all lines after insert line
                , lines.slice(aceEvent.start.row + 1)
            ]
            let _result = []
            for(let _line of _lines) {
                _result = _result.concat(_line)
            }

            data.lines = _result;
        }

        // Detect enter Key
        if( aceEvent.start.row + 1 == aceEvent.end.row
            && aceEvent.lines.length == 2
            && aceEvent.lines[0] == '' && aceEvent.lines[1] == '') {
                // console.log('Split')
                let sr = aceEvent.start.row;
                let sc =  aceEvent.start.column;
                let line = lines[sr]
                let r = [line.slice(0, sc), line.slice(sc)]
                lines[sr] = r[0]
                lines.splice(sr+1, 0, r[1])
            }
        //console.log(data.lines.join('\n'))
    } else {
        console.log('nothing with', aceEvent.action)
    }

    // console.log(data.lines.join('\n'))
    renderer.renderLines(data.lines);
    return result;
}

;main();
