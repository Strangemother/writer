//console.log('new render-worker', ManagerComponent)

class RenderWorker extends ManagerComponent {

    init(){
        console.log('new render-worker')
    }

    mountMethods() {
        return {
            render: this.render.bind(this)
        }
    }

    receiveEvent(e) {
        if( e.action != undefined
            && this[`${e.action}ActionEvent`] != undefined) {
            return [true, this[`${e.action}ActionEvent`](e)]
        }

        return super.receiveEvent(e)
    }

    insertActionEvent(e) {
        console.log('action event')
    }

    render(t) {
        console.log('render the given text.')
    }
}

RenderWorker.mount()
