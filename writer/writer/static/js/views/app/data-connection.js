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
            $.getJSON(url, this.handle(pageId, func))
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
            console.log('new page', name);

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
            return function(data){
                this.pageId = pageId;
                data = this.cleanData(data)
                bus.$emit('page', data)
                bus.$emit('pageId', { pageId: pageId})
                if(func != undefined) {
                    func(data, pageId)
                }
            }.bind(this)
        }
    }
}

var workerMixin = {
    created(){

        this.onReadyCallbacks = []
        this.hooked_renderer = {};
        this.config = {};
        bus.$on('page', this.pageHandle.bind(this))
    }

    , methods:{

        _makeRPC(path, readyCallback) {

            let p = path;
            let self = this;
            let config = this.config;

            let rpc = new WorkerRPC(p, function(){
                if(readyCallback){ readyCallback(rpc, p) };

                console.log('RPC Callback')

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
            console.log('worker manager ready')
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

        setText(data) {
            /* Set the full editor text for the current page.*/
            console.log('dataconnection.setText')
            this.rpc.event({ name: 'setText', data})
        }

        , textUpdate(data) {
            /* called by the interactive application (such as page detail)
            an update of the content is requested. This should be saved
            and utilized. */
            console.log('dataConnection.update')
            // onsole.log('data', data)
            this.stores.streamPage(this.pageId, data);
        }
    }
}


var dataConnection = new Vue({

    mixins: [pageManageMixin, workerMixin, textSessionMixin]
    , data: {
        pageId: -1
    }

    , created(){
        bus.dataConnection = this;
        this.stores = getStores()
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
