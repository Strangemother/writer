/*var pageList = new Vue({
    el: '#page_list'
    , mounted(){

        $(this.$el).find('a').on('click', function(e){
            let v = this.select_page(e.currentTarget.dataset.pk, e)
            if(v === false ){
                e.preventDefault()
            }
        }.bind(this))
    }
    , data: {

    }
    , methods: {
        select_page(pageId, event){
            if(pageId == undefined) {
                return true;
            }


            let url = `/page/data/${pageId}/`
            $.getJSON(url, this.pageDataHandle.bind(this))

            return false;
        }

        , pageDataHandle(data) {
            bus.$emit('page', data)
        }
    }
})
*/

/* Data space for the pseudo storage space. */
var _SingletonDataStore = {};

/* Class and instance for storing data */
class Storage {

    namespace(){
        /* return a unique storage key for the storage.
        In the case of a _SingletonDataStore, this applied scoping
        to many sessions. With localStorage, the key becomes the
        LocalStroage namespace.*/
        return 'data'
    }

    dataSpace(){
        /* Return an object for JS relative writing.
        this object is used for data context */
        return _SingletonDataStore
    }

    save(data){
        /* store the entire dataset to the storage location */
        let space = this.get()
        for(let k in data) {
            space[k] = this.serialize(data[k])
        };
    }

    serialize(data){
        /* convert the given data to a storable unit.*/
        return data;
    }

    serializeRoot(data) {
        /* serialize the root data object as either an initial
        blank entity, or a complete loaded session data object */
        return this.serialize(data);
    }

    normalize(data) {
        /* convert the given serialized data to a readable entity
        for js to digest.*/
        return data;
    }

    get(dkey) {
        /* return the data from the storage.*/
        let data = this.dataSpace();
        let key = this.namespace();

        if(data[key] == undefined) {
            data[key] = this.serializeRoot({});
        }

        if(dkey!= undefined) {
            return this.normalize(data[key][dkey])
        };

        return this.normalize(data[key]);
    }

    set(skey, value) {
        let d = this.get(skey)
        let data = this.dataSpace();
        let key = this.namespace();
        if(d == undefined) {
            data[key][skey] = value
        };
        data[key][skey] = value;
    }

    streamPage(pageId, chunk){
        /*store text data relative to a page.

        The data is stored as array bits  for each chunk given.*/
        let stream = this.get(pageId);
        if(stream == undefined) {
            stream = []
            this.set(pageId, stream)
        }

        let sep = ' ';

        let actionMap = {
            'insert': 1
            , 'remove': 0
        }

        if(chunk == 0) { return stream.length}
        // debugger
        let text = chunk.lines ? chunk.lines.join('\n'): ''
        let header = [
            actionMap[chunk.action],
            chunk.start.column,
            chunk.start.row,
            chunk.end ? chunk.end.column: -1,
            chunk.end ? chunk.end.row: -1,
            text
            ].join(sep)

        stream.push(header)
        this.set(pageId, stream);
        return stream.length
    }

}

class StorageLocal extends Storage {

    dataSpace(){
        return localStorage
    }

    namespace(){
        return 'markdown_editor'
    }

    serialize(d){
        return JSON.stringify(d)
    }

    normalize(d){
        if(typeof(d) == 'string') {
            return JSON.parse(d)
        }
        return d
    }

    streamPage(pageId, chunk){
        /*store text data relative to a page.*/
        let space = this.dataSpace()
        space[pageId] = value;
    }
}

class StorageProxy {
    constructor(storages) {
        this.stores = storages;
    }

    streamPage(data, pageId) {
        /* recevie a chunk update for a page, storing the
        step. */
        for (var i = this.stores.length - 1; i >= 0; i--) {
            this.stores[i].streamPage(data, pageId)
        }
    }

    get length() {
        return this.stores.length
    }
}

var _stores = undefined;
var getStores = function(){
    if(_stores == undefined) {
        _stores = [
            new Storage//,
            //new StorageLocal
        ]
    }

    return new StorageProxy(_stores)
};

var dataConnection = new Vue({
    data: {
        pageId: -1
    }

    , created(){
        this.stores = getStores()
    }

    , methods: {

        getPage(pageId, func){
            console.log('dataConnection.getPage')
            if(pageId == undefined) {
                return true;
            }

            this.loading = pageId
            bus.$emit('loading', { loading: this.loading})

            let url = `/page/data/${pageId}/`
            $.getJSON(url, this.handle(pageId, func))
        }

        , handle(pageId, func) {
            return function(data){
                bus.$emit('page', data)
                this.pageId = pageId;
                bus.$emit('pageId', { pageId: pageId})
                if(func != undefined) {
                    func(data, pageId)
                }
            }.bind(this)
        }

        , update(data) {
            /* called by the interactive application (such as page detail)
            an update of the content is requested. This should be saved
            and utilized. */
            console.log('dataConnection.update')
            console.log(data)
            this.stores.streamPage(this.pageId, data);
        }
    }
})


var pageList = new Vue({
    el: '#page_list'
    , data: {
        bookData: booklistData
        , pages: []
        , pageId: -1
        , loading: 0
        , newPageValue: ''
        , openSubList: []
    }
    , mounted(){
        this.pages = this.bookData.children
        this.pageId = PAGE.id
    }

    , methods: {

        selectPageEvent(data){
            this.select_page(data.item, data.$event)
        }

        , select_page(pageId, event){
            event.preventDefault();
            dataConnection.getPage(pageId, this.pageDataHandle.bind(this))
        }

        , editItem(item, $event) {
            console.log('editItem', item)
            let id =  'P_' + Math.random().toString(32).slice(2)
            $('.tether-templates .edit-page-modal').clone().attr('id', id).appendTo('body')

            let destoryApp = function(view){
                view.$el.remove()
                view.$destroy()
            }

            let app = new Vue({
                el: `#${id}`
                , data: {
                    popupId: id
                    , item: item
                    , classes: {
                        fade: false
                        , error: false
                    }
                }
                , methods: {
                    create(){
                        let listNode = $event.target;

                        let tether = new Tether({
                            element: `#${id}`
                            , target: listNode
                            , enabled: true
                            , attachment: 'top left'
                            , targetAttachment: 'top right'
                            , classes: {
                                element: 'tether-modal'
                            }
                        });
                        setTimeout(function(){
                            let el = this.$refs.name
                            el.focus()
                            el.setSelectionRange(0, el.value.length)
                        }.bind(this), 100)
                        this.tether = tether;
                    }

                    , submitForm(e){
                        console.log('Title', this.item.name)
                        e.preventDefault()
                        let url = `/page/${this.item.object}/update/`
                        $.post(url, { name: this.item.name }, this.submitHandle)
                    }

                    , submitHandle(d) {
                        if(d.value == false)  {
                            this.item.name = d.prev_name
                            this.classes.error = true
                            return;
                        };

                        this.classes.error = false;
                        this.close()
                    }

                    , close(){
                        console.log('Close')
                        this.tether.disable()
                        this.tether.destroy()
                        this.classes.fade=true
                        window.setTimeout(function(){
                            destoryApp(this)
                        }.bind(this), 600)
                    }
                }
            })

            this.tether = app;
            app.create()
        }

        , enterKey(data){
            let value = data.value;
            let parent = data.parent;
            console.log('new page', value);

            let id = PAGE.bookId;
            let pval = ''
            if(parent != undefined) {
                pval = parent.object
            }

            let url = `/book/${id}/new-page/${pval}`
            $.post(url, { name: value }, function(d){
                this.newPageHandle(d)
                this.clearEnterKey(value, d);
            }.bind(this))
        }

        , clearEnterKey(originalValue, data) {
            if(originalValue == data.page_name) {
                this.newPageValue = ''
                let ref = this.$refs[`addPage-` + data.page_child_of]
                if(ref != undefined) {
                    ref[0].newValue = '';
                }

                this.$refs.addPage.newValue = ''
            }
        }

        , indicatorClick(item, $event) {
            console.log('indicatorClick(item, $event)')
            let i = this.openSubList.indexOf(item.object);
            let n = 'remove'

            if(i == -1) {
                this.openSubList.push(item.object)
                n = 'add'

                //  Apply the focus to the newly spawned subment input item
                let refs = this.$refs[`addPage-${item.object}`];
                if(refs) {
                    window.setTimeout(function(){
                        $(refs[0].$el).find('input')[0].focus()
                     }.bind(this), 100)
                }

            } else {
                this.openSubList.splice(i, 1)
            }

            $($event.target)[`${n}Class`]('toggled')
        }

        , newPageHandle(data) {
            let r = {
                name: data.page_name
                , object: data.page_id
                , url: `/page/${data.page_id}`
                , children: []
            };

            if(data.page_child_of == null) {
                this.pages.push(r);
            } else {
                let found = false;
                for (var i = this.pages.length - 1; i >= 0; i--) {
                    let page = this.pages[i];
                    if(page.object == data.page_child_of) {
                        page.children.push(r)
                        found = true
                    }
                }
                if(!found) {
                    let recF = function(pages, match){

                        for (var i = pages.length - 1; i >= 0; i--) {
                            let child = pages[i];
                            if(child.object == match) {
                                return child
                            }

                            if(child.children) {
                                let v = recF(child.children, match);
                                if(v != undefined) {
                                    return v
                                }
                            }
                        }
                    }
                    let page = recF(this.pages, data.page_child_of);
                    if(page != undefined) {
                        page.children.push(r)
                    } else{
                        console.warn('Could not add child item correctly', r)
                    }

                }
            }
        }

        , pageDataHandle(data) {
            this.loading = -1
            bus.$emit('focus')
        }

    }
})
