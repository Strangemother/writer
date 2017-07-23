/*
manage the data session of a page, tracking character entry and page context
 */

class TextSessionWorker extends ManagerComponent {

    init(){

    }

    _receiveEvent(e) {
        console.log('recv', e)
        if( this[`${e.action}ActionEvent`] != undefined) {
            return [true, this[`${e.action}ActionEvent`](e)]
        };
        return super.receiveEvent(e)
    }

    insertActionEvent(e) {
        console.log('TextSessionWorker insert event')
    }

}


TextSessionWorker.mount()
