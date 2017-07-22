var markdownApp = new Vue({
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

    , mounted(){

        if(!window['AceRender']) {
            console.warn('No Renderer')
            return;
        };

        this.createRenderer();
    }

    , methods: {

        createRenderer(){
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
            this.renderer.setText(data.text)
            // this.lastOnlineSave = data.text;
            this.saveButton.disabled = this.synced
        }

        , focusHandle(){
            $('.ace_text-input')[0].focus()
        }

        , rendererCallback(data) {
            /*
            Called by the editor with the event for action.
            This should perpetuate the storage and actions.
             */
            // console.log('rendererCallback', data)
            // this.save(hard=false)
            dataConnection.update(data)
        }

        , save(hard=true){
            if(hard){
                console.info('full save')
                return this.localCache(this.editorValue())
            };

            // console.log('save?')
            this.sessionSaveDistance += 1
            if(!this.synced) {
                this.bouncedSessionSave()
            }

            if(this.sessionSaveDistance > 10) {
                this.localSessionSave()
            }
        }

        , getSessionValue(pageId){
            let d = localStorage['markdown_editor']
            if(d != undefined) {
                this.sessionData = JSON.parse(d)
            }

            return this.sessionData[pageId || this.pageId]
        }


        , deleteSessionValue(pageId){
            let d = localStorage['markdown_editor']
            if(d != undefined) {
                d = JSON.parse(d)
            }

            delete d[pageId || this.pageId]
            localStorage['markdown_editor'] = JSON.stringify(d)
        }

        , editorValue(v) {
            if(v){
                return this.renderer.setText(v);
            }
            return this.renderer.editor.getValue()
        }

        , bouncedSessionSave(){
            return this.localSessionSave()
        }

        , localSessionSave(){

            if(this.sessionData == undefined) {
                let d = localStorage['markdown_editor']
                if(d != undefined) {
                    this.sessionData = JSON.parse(d)
                } else {
                    this.sessionData = {}
                }
            }

            if(this.sessionData[this.pageId] != undefined) {
                // debugger
                if(this.localMismatch) {
                    console.warn('Local mismatch, save session failure.')
                    this.saveButton.disabled = this.synced
                } else {
                    console.warn('sessionSave overwriting local:', this.pageId)

                }
            }

            this.sessionData[this.pageId] = this.editorValue()
            localStorage['markdown_editor'] = JSON.stringify(this.sessionData)

            this.sessionSaveDistance = 0;

            if(this.lastOnlineSave == this.sessionData[this.pageId]) {
                this.synced = true;
                this.saveButton.disabled = this.synced
                return
            }

            this.synced = false;
            this.saveButton.disabled = this.synced
            //this.onlineStore(this.sessionData[this.pageId])
        }

        , onlineStore(data){

            if(data == undefined) {
                data = this.sessionData[this.pageId]
            }

            let d = {
                text_content: data
            }

            if(this.contentId) {
                // Save with ID
                d.id = this.contentId
            } else {
                console.info('Defaulting selected id back to default (index)')
                if(PAGE.indexContentIds != undefined){
                    d.id = PAGE.indexContentIds[PAGE.indexContentIds.length-1]
                }
            }

            if(this.pageId == 'None' || this.pageId == undefined) {
                console.log('No page set')
                return
            }

            $.post(`/page/data/${this.pageId}/`, d, function(result){
                this.lastOnlineSave = data;
                this.synced = true
                this.saveButton.disabled = this.synced
                this.postPageHandle(result);
            }.bind(this))
        }

        , postPageHandle(data) {
            console.log('content id', data.id)
            this.contentId = data.id
        }

        , localCache(data) {
            let o = {};

            if(localStorage['markdown_editor'] != undefined) {
                o = JSON.parse(localStorage['markdown_editor']);
            }

            o[this.pageId] = data
            if(o[this.pageId] != undefined) {
                console.warn(`Local data ${this.pageId} already exists`)
            }

            localStorage['markdown_editor'] = JSON.stringify(o)
        }

    }
})

