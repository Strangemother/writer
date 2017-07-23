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
            this.renderer.setText(this.getInitValue());
            AceRender.config.renderers[0] = this.renderer
            this.renderer.callbacks.push(this.rendererCallback.bind(this));

            // From data connection.
            bus.$on('page', this.pageHandle.bind(this))
            bus.$on('focus', this.focusHandle.bind(this))

            this.tools.push(this.saveButton)
            this.tools.push(this.mismatchButton)
        }

        , getInitValue(){
            /* Return the initial content from the page data load
            If this is blank, a request for data is made -
            replied to by dataConnection*/
            let text = PAGE.initValue;
            if(text.trim().length == 0) {
                console.info('replacing text with init data')
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

        , pageHandle(data) {
            /* receive page data from an internal event. */
            this.pageId = data.id
            this.contentIds = data.content_ids
            this.contentId = data.content_ids[data.content_ids.length-1]
            console.log('pageHandle', data)
            //this.localMismatch = this.localStorageMismatch(data.id, data.text);
            // this.mismatchButton.disabled = !this.localMismatch

            let t = ''
            for (var i = 0; i <data.content_blocks.length; i++) {
               t += data.content_blocks[i].text += '\n'
            }
            this.renderer.setText(t)
            // this.lastOnlineSave = data.text;
            this.saveButton.disabled = this.synced
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
            dataConnection.update(data)
        }

        , postPageHandle(data) {
            console.log('content id', data.id)
            this.contentId = data.id
        }

    }
})
