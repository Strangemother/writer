
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

        , handle(pageId, func) {
            /* return a wrapped function to handle the response from the page
            data endpoint.
            Provide a page ID (for reference) and a function to call on
            success
            */
            return function(data){
                this.pageId = pageId;
                bus.$emit('page', data)
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
            // onsole.log('data', data)
            this.stores.streamPage(this.pageId, data);
        }
    }
})

