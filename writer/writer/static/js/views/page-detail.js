$.ajaxSetup({
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                     if (cookie.substring(0, name.length + 1) == (name + '=')) {
                         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                         break;
                     }
                 }
             }
             return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     }
});


var bus = new Vue({})

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
            </div></span>`
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
        <a :href="item.url" @click='select_page(item.object, $event)' :key="item.object">{{item.name}}</a>
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

var markdownApp = new Vue({
    el: '#markdown_app'

    , data: {
        styles: {
            maxHeight: 'inherit'
        }
        , pageId: PAGE.id
        , contentId: undefined
        , synced: false
        , commands: window['markdownEditorConfig'] ? markdownEditorConfig.commands: {}
        , tools: []
        , lastOnlineSave: ''
        , localMismatch: false
        , saveButton: {
            icon:'save'
            , name: 'save'
            , disabled: self.synced
            , click($event, command){
                console.log('save clicked')
                this.onlineStore()
                bus.$emit('focus')
            }
        }
        , mismatchButton: {
            icon: 'compare_arrows'
            , name: 'mismatch'
            , disabled: true
            , click($event, command){
                console.log('resolve mismatch')

                let v = this.getSessionValue()
                this.editorValue(v)
                window.setTimeout(function(){

                    this.deleteSessionValue()
                    this.saveButton.disabled = false
                    this.localMismatch = this.localStorageMismatch();
                    this.mismatchButton.disabled = !this.localMismatch
                    this.onlineStore(v)
                }.bind(this), 100)

            }
        }

    }

    , mounted(){

        let slowCall = function(){
            if(this._wt) {
                window.clearTimeout(this._wt);
                this._wt = undefined
            }

            this._wt = window.setTimeout(function(){
                this.fitHeight()
            }.bind(this), 300)
        }.bind(this);

        slowCall()

        this.bouncedSessionSave = debounce(this.bouncedSessionSave.bind(this), 2000)

        $(window).resize(slowCall)

        if(window['AceRender']) {
            this.createRenderer()
        } else {
            console.warn('No Renderer')
        }
    }

    , methods: {

        localStorageMismatch(pageId, text) {
            if(pageId == undefined){
                pageId = this.pageId;

            }

            if(text == undefined){
                text = this.editorValue()
            }

            let storedText = this.getSessionValue(pageId);
            if( storedText != undefined
                && storedText.trim().length > 0
                && text != storedText) {
                return true;
            };

            return false;
        }

        , createRenderer(){
            this.renderer = new AceRender('markdown_editor', 'markdown_content')
            let text = PAGE.initValue;
            if(text.trim().length == 0) {
                console.info('replacing text with init data')
                text = $(this.$el).find('.init-markdown').text()
            };

            this.renderer.setText(text);
            AceRender.config.renderers[0] = this.renderer
            this.renderer.callbacks.push(this.rendererCallback.bind(this));

            bus.$on('page', this.pageHandle.bind(this))
            bus.$on('focus', this.focusHandle.bind(this))

            this.tools.push(this.saveButton)
            this.tools.push(this.mismatchButton)
        }

        , actionCommand(command, $event) {
            if(command.disabled == true) {
                console.log('disabled button')
                return
            }

            if(command.click) {
                return command.click.call(this, $event, command)
            }

            // Mention: Vue.js is so fucking awesome.
            this.renderer.onCommand(this.renderer.editor, command)
        }

        , pageHandle(data) {
            /* receive page data from an internal event. */
            this.pageId = data.id
            this.contentIds = data.content_ids
            this.contentId = data.content_ids[data.content_ids.length-1]
            console.log('pageHandle', data)
            this.localMismatch = this.localStorageMismatch(data.id, data.text);
            this.mismatchButton.disabled = !this.localMismatch
            this.renderer.setText(data.text)
            this.lastOnlineSave = data.text;
            this.saveButton.disabled = this.synced
        }

        , focusHandle(){
            $('.ace_text-input')[0].focus()

        }

        , rendererCallback(data) {
            console.log('rendererCallback', data)
            this.save(hard=false)
        }

        , save(hard=true){
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

        , editorValue(v) {
            if(v){
                return this.renderer.setText(v);
            }
            return this.renderer.editor.getValue()
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
            // bus.$emit('save', {
            //     value: data
            //     , id: this.pageId
            //     , vue: this
            //     , editor: this.renderer
            // })

        }
        , postPageHandle(data) {
            console.log('content id', data.id)
            this.contentId = data.id
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

        , fitHeight(){
            console.log('resize')
            let top = $(this.$el).position().top;
            let viewHeight = $(window).height();
            let height = viewHeight - top;

            this.styles.maxHeight = `${height}px`;
            this.styles.minHeight = `${height}px`;
        }
    }
})



// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
