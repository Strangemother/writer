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

var pageList = new Vue({
    el: '#page_list'
    , data: {
        bookData: booklistData
        , pages: []
        , pageId: -1
        , loading: 0
        , newPageValue: ''
    }
    , mounted(){
        this.pages = this.bookData.children
        this.pageId = PAGE.id
    }

    , methods: {
        select_page(pageId, event){
            event.preventDefault();

            if(pageId == undefined) {
                return true;
            }

            this.loading = pageId
            let url = `/page/data/${pageId}/`
            $.getJSON(url, this.pageDataHandle.bind(this))
        }

        , enterKey(value){
            console.log('new page', value);
            let id = PAGE.bookId
            let url = `/book/${id}/new-page/`
            $.post(url, { name: value }, function(d){
                this.newPageHandle(d)
                this.clearEnterKey(value, d);
            }.bind(this))
        }

        , newPageHandle(data) {
            let r = {
                name: data.page_name
                , object: data.page_id
                , url: `/page/${data.page_id}`
            };
            this.pages.push(r)
        }

        , clearEnterKey(originalValue, data) {
            if(originalValue == data.page_name) {
                this.newPageValue = ''
            }
        }

        , pageDataHandle(data) {
            this.loading = -1
            bus.$emit('page', data)
            this.pageId = data.id
        }
    }
})
