/*
Manage the line alterations of the editor. Each event captured from the
receiver manipulates the block contents. Each block maps to a line within the
editor.

Blocks are managed internally from a given start Text.
*/


class Collection {
    /* */

}

class BlockManager {

    constructor(session) {
        this.session = session
        // other sessions maintained, but not current.
        this.lines = session ? session.lines: []
        this.hasSession = session != undefined
        this.index = {};
    }

    addIndex(index, lines) {
        /* Push all lines to a single contentId index*/
        this.index[index] = lines;
    }
}

class PageWorker extends ManagerComponent {
    init(){
        this.session = {}
        this._emptySessions = []
        this.onEvent(this.eventHandle.bind(this))
    }

    eventHandle(event){
        /* Receive an event from the onEvent handler. Call any function with
        the postfix of the event.name "event_fooName". */
        let name = `event_${event.name}`
        console.info('!Page', event)
        if(this[name] != undefined){
            this[name](event)
        } else{
            console.info(event)
        }
    }

    emptySession(lines) {
        /* Start a session without using the currentSession.
        This may occur if setPage was not received before setLines.*/
        let b = new BlockManager()
        b.lines = lines
        return b
    }

    getSession(event){

        let _s = this.session[this.currentSession]
        if(this.currentSession == undefined) {
            _s = this.emptySession(event ? event.data: {})
            this.currentSession = this._emptySessions.push(_s) - 1;
        }

        if(_s == undefined) {
            return this._emptySessions[this.currentSession];
        }

        return _s
    }

    event_setPage(event) {
        /* Main page data */
        console.log('setPage', event);
        this.session[event.data.id] = new BlockManager(event.data);
        this.currentSession = event.data.id;

    }

    event_setLines(event){
        /* Push the entire line-set into the session block.
        if no current session is defined, a new empty session is created.
        */
        let _s = this.getSession(event)
        // Loop lines, of which should match exactly to the
        // setPage content.
        // If no blockContent exists, a new id is created.
        let lines = event.data;
        if(!_s.hasSession) {
            _s.addIndex(0, lines)
        }
    }

    event_splitBlockAtIndex(event) {
        /* Line block has split*/

    }
}


PageWorker.mount('page')

