/* serving the left-hand book navigation within the page editor view. */

var addPageComponent = Vue.component('add-page', {
    template: `<span class="new-page-item">
        <div class="indicator-container">
                <div :class="['indicator input']"></div>
            </div>
            <div class="input-field inline">
                <input type="text"
                    @keyup.enter='enterKey($event.target.value, parent)'
                    placeholder='Add Page'
                    v-model='newValue'
                    class='new-page-input'>
            </div>
        </span>`
    , data(){
        return {
            newValue: ''
        }
    }

    , props: ['parent']
    , methods: {
        enterKey(value, parent){
            this.$emit('enter', {value, parent})
        }
    }
})


var pageItem = Vue.component('page-item', {
    template: `<div class="flex-inline">
        <div class="indicator-container" @click='indicatorClick(item, $event)'>
            <div :class="['indicator', {active: item.object == pageId, loading: item.object == loading}]"></div>
        </div>
        <div class="page-entity">
            <a :href="item.url" @click='select_page(item.object, $event)' :key="item.object">{{item.name}}</a>
            <ul class="page-blocks">
                <li class="page-block-item"
                    v-show='item.object == pageId'
                    v-for='block in item.blocks' :weight='block.weight'>
                    <a :href="'/block/' + block.id" class="block-link">{{ block.name.length == 0 ? "Block " + block.id: block.name }}</a>
                </li>
            </ul>
        </div>
    </div>`
    , props: ['item']

    , data(){
        return {
            loading: -1
            , pageId: -1
        }
    }

    , mounted(){
        bus.$on('loading', function(data){ this.loading = data.loading }.bind(this))
        bus.$on('pageId', function(data){ this.pageId = data.pageId }.bind(this))
    }

    , methods: {
        select_page(item, $event){
            $event.preventDefault()
            this.$emit('select_page', {item, $event});
        }

        , indicatorClick(item, $event) {
            // console.log('indicatorClick(item, $event)')
            this.$emit('indicator_click', {item, $event});
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

    , created(){
        bus.menuApp = this;
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

        , newPage(data, callback) {
            /* Send a new page reqest, calling the optional callback on complete.
             */
            dataConnection.newPage(data, callback)
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
                        }.bind(this), 100);

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
            /* An enter key created a new page */

            let callback = function(d){
                this.newPageHandle(d)
                this.clearEnterKey(data.value, d);
            }.bind(this);

            this.newPage(data, callback);
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
