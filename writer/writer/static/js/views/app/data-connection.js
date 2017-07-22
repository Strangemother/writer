
var dataConnection = new Vue({
    data: {
        pageId: -1
    }

    , created(){
        this.stores = getStores()
    }

    , methods: {

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

        , cleanData(data) {
            /*return ready data for the application*/
            let text = '';
            for (var i = 0; i < data.content_blocks.length; i++) {

                text += '\n\n' + data.content_blocks[i].text;
            };

            data.text = text;
            return data;
        }

        , update(data) {
            /* called by the interactive application (such as page detail)
            an update of the content is requested. This should be saved
            and utilized. */
            console.log('dataConnection.update')
            // onsole.log('data', data)
            this.stores.streamPage(this.pageId, data);
        }
    }
})

