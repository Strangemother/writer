var metaApp = new Vue({
    el: '#meta'
    , mounted(){
        $('.toggle-meta').on('click', this.toggleClick.bind(this))
    }
    , methods: {
        toggleClick(){
            $('.page-info').toggleClass('hidden')
        }
    }
})


var markdownApp = new Vue({
    el: '#markdown_app'

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
        $(window).resize(slowCall)
        this.renderer = new AceRender('markdown_editor', 'markdown_content')
        AceRender.config.renderers[0] = this.renderer
    }
    , data: {
        styles: {
            maxHeight: 'inherit'
        }
        , commands: AceRender.config.commands
    }
    , methods: {
        fitHeight(){
            console.log('resize')
            let top = $(this.$el).position().top;
            let viewHeight = $(window).height();
            let height = viewHeight - top;

            this.styles.maxHeight = `${height}px`;
            this.styles.minHeight = `${height}px`;
        }
    }
})
