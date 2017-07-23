//console.log('new render-worker', ManagerComponent)
importScripts(
    '/static/js/marked/lib/marked.js'
    , '/static/js/vendor/highlight.pack.js'
)


class MarkdownRenderer {
    constructor() {
        marked.setOptions({
          renderer: new marked.Renderer(),
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          highlight: function (code) {
            return hljs.highlightAuto(code).value;
          }
        });
    }

    renderLines(lines){
        return this.render(lines.join('\n'))
    }

    render(s){
        var self = this;
        return marked(s, (function(data){
            return function (err, rs) {
                if (err) throw err;
                self.rendered(rs,s);
            }
       })(data) ) ;
    }

    rendered(rStr, oStr) {
        postMessage({
            type: 'render'
            , content: rStr
        })
    }
}


class RenderWorker extends ManagerComponent {

    init(){
        this.renderer = new MarkdownRenderer();
        this.invalid
    }

    mountMethods() {
        return {
            render: this.render.bind(this)
        }
    }

    _receiveEvent(e) {
        if( e.action != undefined
            && this[`${e.action}ActionEvent`] != undefined) {
            return [true, this[`${e.action}ActionEvent`](e)]
        }

        return super._receiveEvent(e)
    }

    insertActionEvent(e) {
        //console.log('RenderWorker insert action')
        this.invalid = true;
        return this.render(e)
    }

    render(t) {
        return 'doggy'
    }
}


RenderWorker.mount()
