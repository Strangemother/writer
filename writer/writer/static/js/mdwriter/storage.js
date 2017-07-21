/*
Storage routines for the data in and out.
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
