window.markdownEditorConfig = {
    commands: {}
    , intelliKeys: {}
    // , addCommands
    // , addIntelliKeys
}

;(function(){

let config;


commands = {
};

intelliKeys = {
    markA: {
        id: 'sqi'
        , name: 'single quote insert'
        , char: "'"
        , wrapSelected: true
    }

    , markB: {
        id: 'dqi'
        , name: 'double quote insert'
        , char: '"'
        , wrapSelected: true
    }

    , markTick: {
        id: 'tqi'
        , name: 'tick quote insert'
        , char: '`'
        , wrapSelected: true
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

class EditorTextBase {

    setText(text, editor) {
        editor = editor == undefined? this.editor: editor;
        editor.setValue(text)
        editor.clearSelection()

        // if(rpc._ready == false) {
        //     console.info('RPC not prepared', htmlText)
        //     this._earlySetText = htmlText
        //     return
        // }
        bus.$emit('editor-settext', { text, editor, parent: this})

        // this.outputNode.innerHTML = this.outputNode.innerHTML;
    }

    getText(){
        return this.editor.getValue()
    }

    getSelected(editor){
        editor = editor == undefined? this.editor: editor;
        return editor.session.getTextRange(this.getSelectRange(editor));
    }

    getSelectRange(editor){
        editor = editor == undefined? this.editor: editor;
        return editor.getSelectionRange()
    }

    setSelectRange(editor, startRow, startCol, endRow, endCol){

        if(IT.g(editor).is('number') && endCol == undefined) {
            // shift back if the editor is missing;
            endCol= endRow;
            endRow = startCol;
            startCol = startRow;
            startRow = editor;
            editor = undefined;
        }

        editor = editor == undefined? this.editor: editor;
        let range = new Range(startRow, startCol, endRow, endCol)
        editor.selection.setRange(range)
        bus.$emit('editor-selectrange', { range, editor, parent: this})
    }

    styles() {
        return {
            fontSize: "18px"
        }
    }

    editorOptions(){
        return {
            // wrap text to view
            // useWrapMode: true
            indentedSoftWrap: false
            , mode: "ace/mode/markdown"
            , theme: "ace/theme/chrome"
            , wrap: false
            , showGutter: true
            , 'showLineNumbers': true
        }
    }

    makeEditor(IDhtml) {

        let change = (function(p, editor) {
            return function(e){
                p.editorChangeEvent(editor, e)
            }
        })(this, editor)

        var editor = ace.edit(IDhtml);
        let session = editor.getSession();


        let options = this.editorOptions();
        editor.setOptions(options);
        editor.setTheme(options.theme);
        session.setMode(options.mode);
        editor.renderer.setShowGutter(options.showGutter)

        editor.$blockScrolling = Infinity

        let styles = this.styles();
        for(let name in styles) {
            editor.container.style[name] = styles[name];
        }

        this.addCommands(editor, commands);

        this.addCommands(editor, markdownEditorConfig.commands)
        this.addIntelliKeys(editor, intelliKeys);
        this.addIntelliKeys(editor, markdownEditorConfig.intelliKeys);
        session.on('change', change)

        return editor;
    }

}

class CommandEventBase extends EditorTextBase {

    addCommands(editor, o) {

        for(var key in o) {
            let _id = o[key].id || key;
            let name = o[key].name || key;
            let bindKey = o[key].bindKey;
            let caller = o[key].func
            let exec = caller != undefined ? caller: this.bindCommand(o[key])
            let r = {name, bindKey, exec}
            editor.commands.addCommand(r)
        }
    }

    bindCommand(o) {
        var self= this;
        let f = (function(o){
            return function(editor){
                self.onCommand(editor, o)
            }
        })(o)

        return f;
    }

    _dispatch(content, cb) {
        bus.$emit('renderer-event', { content, callback: cb });
    }

    onCommand(editor, o) {
        console.log('key', o)
        if(o.insert) {

            // Push chars around cursor or selection
            let sel = this.getSelected(editor);
            let cursorIndex = o.insert.indexOf("|");
            let v = o.insert;
            let range = this.getSelectRange(editor);

            let remove = false;

            if(o.reverse == true){

                let col = range.start.column;
                let row = range.start.row;
                let preRange;
                let postRange;

                if(row == range.end.row) {
                    console.log('single line check')
                    preRange = new Range(row, col - cursorIndex, row, col );
                    postRange = new Range(row, col+sel.length, row, col+sel.length+cursorIndex)
                } else {
                    console.log('multirow check')

                    preRange = new Range(row, col - cursorIndex, row, col );
                    postRange = new Range(range.end.row, range.end.column, range.end.row, range.end.column+cursorIndex)
                }

                let preText = editor.session.getTextRange(preRange)
                let postText = editor.session.getTextRange(postRange)
                if(
                    preText == v.slice(0, cursorIndex)
                    && postText == v.slice(cursorIndex+1)
                    ) {
                    remove = true;
                }

            }

            if(remove) {
                console.log('remove', v)
                let col = range.start.column
                    , row = range.start.row
                    , preRange = new Range(row, col - cursorIndex, row, col )
                    , postRange = new Range(row, col+sel.length, row, col+sel.length+cursorIndex)
                    , preText = editor.session.getTextRange(preRange)
                    , postText = editor.session.getTextRange(postRange)
                    ;
                if(col != range.end.column) {
                    postRange = new Range(range.end.row, range.end.column, range.end.row, range.end.column+cursorIndex)
                    postText = editor.session.getTextRange(postRange)
                }

                editor.session.remove(postRange)
                editor.session.remove(preRange)

                if(cursorIndex > -1){
                    // split the value, using the start and end
                    // to check and strip the args.
                    // debugger

                    // delete sel.length + the width of the pre and post
                    // This is at position preText.start <> postText.end
                    // Insert the sel text at cursor position
                }
            } else {
                // debugger;
                if(cursorIndex > -1){
                    v = o.insert.replace("|", sel)
                }

                editor.insert(v);

                if(range != undefined) {
                    // reselect
                    // last row right padding for selection of
                    // multiple lines
                    let padding = 0
                    if(range.start.row != range.end.row) {
                        padding = -cursorIndex
                    }

                    this.setSelectRange(editor
                        , range.start.row
                        , range.start.column + cursorIndex
                        , range.end.row
                        , range.end.column + cursorIndex + padding)
                }
            }
        }
    }


    addIntelliKeys(editor, intelliKeys){
        for(var k in intelliKeys) {
            let key = intelliKeys[k].char || k;
            this.intelliLine[key] = intelliKeys[k];
        }
    }

}

class RenderBase extends CommandEventBase {

    editorChangeEvent(editor, aceEvent) {
        /* read the value from the event and
        apply the content to the view.*/
        let event = aceEvent.action
        let fn = `${event}AceEvent`;
        this._dispatch(aceEvent)
        if(this[fn] != undefined){
            this[fn](editor, aceEvent);
        } else {
            console.log(event, aceEvent)
        }
    }

    insertAceEvent(editor, ev) {
        this._insertToEditor(editor, ev)
    }

    removeAceEvent(editor, ev) {
        let lines = this.outputNode.innerHTML.split('\n');
        let startRow = lines[ev.start.row];
        let endRow = lines[ev.end.row];
        let selected;

        if(lines[ev.end.row] == undefined) {
            // out of sync
            console.log('Broken')
            return false;
        }

        if(ev.start.row == ev.end.row) {
            selected = lines[ev.end.row].slice(ev.start.column, ev.end.column)
        } else {
            let selectedLines = lines.slice(ev.start.row, ev.end.row+1)
            selectedLines[0] = selectedLines[0].slice(ev.start.column, selectedLines[0].length)
            selectedLines[selectedLines.length-1] = selectedLines[selectedLines.length-1].slice(0, ev.end.column)
            selected = selectedLines.join('\n')
        }

        // console.log('editor: Deleted:', selected);
    }

    _insertToEditor(editor, ev) {
        // console.log('insert event', ev)
        let l = this.intelliLine[ev.lines[0]];
        if(ev.lines.length==1 && l != undefined) {
            // A Mapping exists for an entry of this.
            console.log('Found', l)
        } else {

        }
    }
}


class AceRender extends RenderBase {

    constructor(editorName, contentName){
        super()
        this.intelliLine = {}
        this.callbacks = []
        this.editor = this.makeEditor(editorName)
        // onReadyCallbacks.push(this.sendWaiting.bind(this))

        if(contentName != undefined) {
            this.outputNode = document.getElementById(contentName)
            let t = this.outputNode.innerHTML;
            this.setText(t, this.editor);
        }
    }


    // sendWaiting() {
    //     if(this._waiting == undefined) {
    //         return
    //     };
    //     for (var i = 0; i < this._waiting.length; i++) {
    //         this.send(this._waiting[i][0], this._waiting[i][1])
    //     }

    //     if(this._earlySetText) {
    //         console.log('setting early text')
    //         window.setTimeout(function(){
    //             this.setText(this._earlySetText);
    //             delete this._earlySetText
    //         }.bind(this), 100)
    //     }
    // }

    // renderWorkerMessage(e) {
    //     let oldHeight = this.outputNode.clientHeight;
    //     this.outputNode.innerHTML = String(e.data.content)
    //     if(oldHeight != this.outputNode.clientHeight) {
    //         this.editor.resize()
    //     }
    // }
//
    // textHandleEvent(d) {
    //     rpc.setText(this.getText(), this.eventReply.bind(this))
    // }
};

config = {
    renderers: []
    , commands: commands
    , intelliKeys: intelliKeys
    , renderClass: AceRender
};

window.AceRender = AceRender;
AceRender.config = config

})()
