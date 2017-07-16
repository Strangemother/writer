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

            if(pageId == undefined) {
                return true;
            }

            this.loading = pageId
            bus.$emit('loading', { loading: this.loading})

            let url = `/page/data/${pageId}/`
            $.getJSON(url, this.pageDataHandle.bind(this))
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
            bus.$emit('loading', { loading: this.loading})
            bus.$emit('page', data)
            this.pageId = data.id

            bus.$emit('pageId', { pageId: this.pageId})
            bus.$emit('focus')
        }
    }
})
