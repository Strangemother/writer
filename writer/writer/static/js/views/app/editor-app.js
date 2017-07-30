/* Editor application will render an editor with all the configuration
for the book page editor.

All communiunication is requested through the dataConnection, all events
are captured through the bus.
*/

var editorApp = new Vue({
    el: '#markdown_app'

    , data: {
        styles: {
            maxHeight: 'inherit'
        }
        , pageId: PAGE.id
        , contentId: undefined
        , synced: false
        , commands: window['markdownEditorConfig'] ? markdownEditorConfig.commands: {}
        , tools: []
        , lastOnlineSave: ''
        , localMismatch: false
        , saveButton: {
            icon:'save'
            , name: 'save'
            , classes: ''
            , disabled: self.synced
            , click($event, command){
                console.log('save clicked')
                this.onlineStore()
                bus.$emit('focus')
            }
        }

        , mismatchButton: {
            icon: 'compare_arrows'
            , name: 'mismatch'
            , disabled: true
            , click($event, command){
                console.log('resolve mismatch')

                let v = this.getSessionValue()
                this.editorValue(v)
                window.setTimeout(function(){

                    this.deleteSessionValue()
                    this.saveButton.disabled = false
                    this.localMismatch = this.localStorageMismatch();
                    this.mismatchButton.disabled = !this.localMismatch
                    this.onlineStore(v)
                }.bind(this), 100)

            }
        }

    }

    , created(){
        bus.editorApp = this;
    }

    , mounted(){
        this.createRenderer();
    }

    , methods: {

        createRenderer(){
            /*
            Create a markdown editor, attach the render callband and append
            and buttons for additional actions such as window based keyboard events.
            */
            this.renderer = new AceRender('markdown_editor', 'markdown_content')
            // this.renderer.setText(this.getInitValue());
            dataConnection.setFromLocalSave(this.renderer)
            AceRender.config.renderers[0] = this.renderer
            this.renderer.callbacks.push(this.rendererCallback.bind(this));

            // From data connection.
            bus.$on('page', this.pageHandle.bind(this))
            bus.$on('focus', this.focusHandle.bind(this))
            bus.$on('local-saved', this.localSavedHandle.bind(this))

            /* Dispatched from the sub componentr 'editor' editor.js */
            bus.$on('editor-settext', this.editorSetTextHandle.bind(this))

            this.tools.push(this.saveButton)
            this.tools.push(this.mismatchButton)
        }

        , getInitValue(){
            /* Return the initial content from the page data load
            If this is blank, a request for data is made -
            replied to by dataConnection*/
            return dataConnection.getLocalSave().join('\n')

            let text = PAGE.initValue;
            if(text.trim().length == 0) {
                text = $(this.$el).find('.init-markdown').text()
            };

            return text;
        }

        , actionCommand(command, $event) {
            /* A UI action click (or some sort of hook) event to call
            the given `command` click function.*/

            if(command.disabled == true) {
                console.log('disabled button')
                return
            }

            if(command.click) {
                return command.click.call(this, $event, command)
            }

            this.renderer.onCommand(this.renderer.editor, command)
        }

        , localSavedHandle(){
            this.saveButton.classes = 'btn btn-floating pulse'
            let time = 1500
            if(this._localSaveTimer != undefined) {
                clearTimeout(this._localSaveTimer)
                time = 700
            }

            this._localSaveTimer = window.setTimeout(function(){
                this.saveButton.classes = 'btn btn-floating'
            }.bind(this), time)
        }

        , pageHandle(data) {
            /* receive page data from dataConnectoin or other internal event. */
            console.log('editor-app loading page handle', data)

            this.pageId = data.id
            // this.contentIds = data.content_ids
            // this.contentId = data.content_ids[data.content_ids.length-1]
            this.renderer.setText(data.lines.join('\n'))
            // this.renderer.setText(t)
            // this.lastOnlineSave = data.text;
            this.saveButton.disabled = false;// this.synced
        }

         , editorSetTextHandle(e){
            /*
            The child editor dispatched the 'settext' event. Perpetuate this to
            the data connection
             */
            // this.renderer.setText(e.text)
            console.log('editorSetTextHandle')
            // dataConnection.setText(e.text)
        }

        , focusHandle(){
            /* explicitly push the focus to the editor window.*/
            $('.ace_text-input')[0].focus()
        }

        , editorValue(v) {
            /* Get or set the complete editor value as text. */
            if(v){ return this.renderer.setText(v); }
            return this.renderer.editor.getValue()
        }

        , rendererCallback(data) {
            /*
            Called by the editor with the event for action.
            This should perpetuate the storage and actions.
             */

            dataConnection.textUpdate(data)
        }

        , postPageHandle(data) {
            console.log('content id', data.id)
            this.contentId = data.id
        }

    }
})
