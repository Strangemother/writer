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

var dataConnection = new Vue({

    methods: {

        getPage(pageId, func){
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
                bus.$emit('pageId', { pageId: pageId})
                if(func != undefined) {
                    func(data, pageId)
                }
            }.bind(this)
        }

        , update(data) {
            console.log(data)
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
