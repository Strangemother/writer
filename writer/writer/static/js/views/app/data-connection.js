var pageManageMixin = {

    methods: {

        getPage(pageId, func){
            /* Fetch a page through event, result data is given to the
            func.*/
            console.log('dataConnection.getPage')
            if(pageId == undefined) {
                return true;
            }

            this.loading = pageId
            bus.$emit('loading', { loading: this.loading})

            let url = `/page/data/${pageId}/`
            let self = this;
            $.getJSON(url, function(data){
                if(func != undefined) {
                    func(data, pageId)
                };

                self.pageId = pageId;
                bus.$emit('page', data)
                bus.$emit('pageId', { pageId: pageId})
            })
        }

        , newPage(data, callback) {
            /* Send a new page reqest, calling the optional callback on complete.
                data == {
                    bookId: optional - default: PAGE.bookId.
                    , parentId: optional - default from data.parent.object<pk>
                }

                if parentId is not defined, the page will live on the root
                of the book.
             */


            let name = data.value;
            let parent = data.parentId || data.parent;

            let bookId = data.bookId || PAGE.bookId;
            let pId = ''
            if(parent != undefined) {
                pId = parent.object
            }

            let url = `/book/${bookId}/new-page/${pId}`
            $.post(url, { name: name }, callback)
        }

        , handle(pageId, func) {
            /* return a wrapped function to handle the response from the page
            data endpoint.
            Provide a page ID (for reference) and a function to call on
            success
            */
            return
        }
    }
}

var workerMixin = {
    created(){

        this.onReadyCallbacks = []
        this.hooked_renderer = {};
        this.config = {};
        bus.$on('page', this.pageHandle.bind(this))
        this._logCallbacks= []

        bus.$on('log-attach', function(d){
            if(this.rpc != undefined
                && this.rpc._ready == true) {
                this.addLogCallback(d)
            } else {
                this._logCallbacks.push(d)
            }
        }.bind(this))

    }

    , methods:{

        addLogCallback(d, rpc) {
            if(rpc == undefined) {
                rpc = this.rpc;
            };


            for(let name in d) {
                if(rpc._methods[name] == undefined) {
                    rpc._methods[name] = []
                };

                rpc._methods[name].push(d[name]);
            }
        }

        , _makeRPC(path, readyCallback) {

            let p = path;
            let self = this;
            let config = this.config;

            let rpc = new WorkerRPC(p, function(){
                if(readyCallback){ readyCallback(rpc, p) };

                for (var i = 0; i < self.onReadyCallbacks.length; i++) {
                    self.onReadyCallbacks[i](self.rpc);
                }
            }, function(e){
                let fn = `${e.data.type}WorkerMessage`;

                if(self.hooked_renderer == undefined) {
                    console.warn('message too early.')
                    return
                }

                if(config.renderers != undefined) {

                    for (var i = config.renderers.length - 1; i >= 0; i--) {
                        if(config.renderers[i][fn] != undefined) {
                            config.renderers[i][fn](e)
                        }
                    }
                }

                if(self.hooked_renderer[fn] != undefined) {
                    self.hooked_renderer[fn](e)
                }

            });

            console.log('making rpc, collecting _logCallbacks', this._logCallbacks)
            for (var i = 0; i < this._logCallbacks.length; i++) {
                let item = this._logCallbacks[i];
                this.addLogCallback(item, rpc);
            };

            this._logCallbacks

            return rpc;
        }

        , pageHandle(data){
            console.log('dataConnection.pageHandle')
            this.rpc.event({name: 'setPage', data})
        }

        , makeRPC(workerPath, clientPaths) {
            /* Geenerate a new RPC */
            this._clientPaths = clientPaths
            this._workerPath = workerPath;

            return this.rpc = this._makeRPC(workerPath, this.workerReady.bind(this))
        }

        , workerReady(rpc, path) {
            //console.log('worker manager ready')
            for (var i = 0; i < this._clientPaths.length; i++) {
                rpc.addWorker(this._clientPaths[i])
            }
        }

    }
}

var textSessionMixin = {
    /* Handle inline and session changes to text. Perpetuating those changes
    to the worker manager and emiting events upon complete.*/
    methods: {

        setLines(data) {
            /* Set the full editor text for the current page.*/
            console.log('dataconnection.setText')
            if(this.rpc != undefined && this.rpc._ready == true) {
                this._sendLinesRPC(data, this.rpc)
            }

            this._earlySetText = data;
            this.onReadyCallbacks.push(function(rpc){
                this._sendLinesRPC(this._earlySetText, rpc)
                delete this._earlySetText
            }.bind(this))

        }

        , _sendLinesRPC(data, rpc) {
            return rpc.event({ name: 'setLines', data})

        }
        , textUpdate(data) {
            /* called by the interactive application (such as page detail)
            an update of the content is requested. This should be saved
            and utilized. */

            console.log('dataConnection.update')
            // console.log('data', data)
            this.stores.streamPage(this.pageId, data);
        }
    }
}


var editorLocalSaveMixin = {
    /* Manage base local storage of the immediate view - independent
    from the worker and online storage to ensure 0 losses.*/
    created(){
        bus.$on('renderer-event', this.renderEvent.bind(this));
        // not bound.
        this.eventCache = []

    }

    , data: {
        // timeout delay before auto-saving.
        delay: 700
        // If the save timer event cache list exceeds the entropy limit, force
        // save the data.
        , entropy: 10
        , conflicts: []
        , saveId: -1
    }

    , methods: {
        editorLines(){
            /* return the lines of the editor - lowest possible denominator. */
            return editorApp.renderer.editor.session.doc.$lines;
        }

        , renderEvent(data) {
            /*
            { content, callback: cb }

            for every call, the event is pushed into a cache and a timeout
            merged the result into lines.
            The result is stored as the current view cache. Without syncing issues
            this should match the lines in the worker.
             */

            this.eventCache.push(data)
            this.startOrResetTimer()
        }

        , isLocalSaved(){
            if(
                this.eventCache.length == 0
            ) {
                return true
            }

            return false;
        }

        , startOrResetTimer(){
            /* restart the time if required or start if it doesnt exist.*/
            if(this._timer != undefined) {
                window.clearTimeout(this._timer)
            }


            if(this.eventCache.length > this.entropy) {
                this.eventCacheTimer.bind(this)()
            };

            let delay = this.delay || 1000;
            this._timer = window.setTimeout(this.eventCacheTimer.bind(this), delay)
        }

        , eventCacheTimer(){
            /* Called by the timer to store all event cache data */
            let eventCache = this.eventCache.slice();
            // Immediately clear the events.
            this.eventCache = []
            // for (var i = 0; i < eventCache.length; i++) {
            //     this.writeEvent(eventCache[i])
            // }


            // Meh. For now just block save the text. It should be fine.
            let flag = this.inUpdateState == this.saveId;
            this.localSave(this.saveId, undefined, overwrite=flag)
        }

        , writeEvent(event) {
            /* Write aN event into the lines data.*/
        }

        , getLocalSave(id=-1) {
            /* returns lines or empty array*/
            let name = 'editor-local-cache'
            let storeId = `${name}-${id}`
            if(localStorage[storeId] != undefined) {
                return JSON.parse(localStorage[storeId])
            };

            return []
        }

        , setFromLocalSave(editor, id=-1) {
            /* set the editor text to the local save data (if any) and
            begin state caching for incoming data */
            this.inUpdateState = id
            let lines = this.getLocalSave(id)
            let text = lines.join('\n');
            editor.setText(text)
            this.setLines(lines)
        }

        , localSave(id, lines, overwrite=false) {
            if(id == undefined) {
                id = this.pageId;
            };

            if(lines == undefined) {
                lines =  this.editorLines()
            };

            let name = 'editor-local-cache'
            let storeId = `${name}-${id}`

            if(lines.join() == '') {
                // no need to save
                return true;
            }

            let jsonData = JSON.stringify(lines);

            if(localStorage[storeId] != undefined) {
                if(localStorage[storeId] == jsonData) {
                    // no need to save
                    return true;
                }

                // conflict.
                if(overwrite == false) {
                    return this.localSaveConflict(id, lines)
                }
            }

            localStorage[storeId] = jsonData

            bus.$emit('local-saved', { id, storeId })
            return true;
        }

        , localSaveConflict(storeId, lines) {
            /* data exists at the  storeId when saving the lines. */
            console.warn('Local save conflict on', storeId)
            if(storeId == 'conflicts') {
                console.error('Wooh! Local conflicts on local conflicts?')
            };

            this.conflicts.push({ storeId, lines })
            let saved = this.localSave('conflicts', this.conflicts, true)
            if(saved == false) {
                // now we're in trouble.
                console.error('Could not save conflicts.')
            };

            return saved;
        }

    }
}

var dataConnection = new Vue({

    mixins: [pageManageMixin, workerMixin, textSessionMixin, editorLocalSaveMixin]
    , data: {
        pageId: -1
    }

    , created(){
        bus.dataConnection = this;
        this.stores = getStores()
        bus.$emit('data-connection', { item: this })
    }

    , methods: {

        cleanData(data) {
            /*return ready data for the application*/
            let text = '';
            for (var i = 0; i < data.content_blocks.length; i++) {

                text += '\n\n' + data.content_blocks[i].text;
            };

            // data.text = text;
            return data;
        }

    }
})









let removed = {
    save(hard=true){
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
