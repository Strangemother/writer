/*
manage the data session of a page, tracking character entry and page context
 */

class TextSessionWorker extends ManagerComponent {

    init(){
        this.session = {
            _started: +(new Date)
            , events: []
            , lines: []
        }
    }

    _receiveEvent(e) {
        if( this[`${e.action}ActionEvent`] != undefined) {
            return [true, this[`${e.action}ActionEvent`].call(this, e)]
        };
        return super._receiveEvent(e)
    }

    setTextEvent(data) {
        /* Automatically hooked to the testText event, capture the meta data for any incoming changes.*/
        console.log('TextSessionWorker setTextEvent', data)
    }

    setPageEvent(page){
        console.log('TextSessionWorker set page', page)
        this.session.page = page
        this.session.blocks = page.data.content_blocks
    }

    insertActionEvent(e) {
        /* From here we manage the text session, page updates denote
        any extra meta data required for running the
        page context. */
        this.session.events.push(e)
        //console.log('TextSessionWorker insert event', e)
        if(e.start.row == e.end.row) {
            this.insertLine(e)
        } else {
            this.insertLines(e)
        }
    }

    insertLine(e){
        /* a single line insert event occured such as a char.
            + find the session block index (should match the event row)
            + Split the line at the position
            + inject new content
        */
        let blockIndex = e.start.row
            , sCol = e.start.column
            , eCol = e.end.column
            , value = e.lines[0]

        this.injectTextInBlock(blockIndex, sCol, value)
    }

    injectTextInBlock(blockIndex, strIndex, value) {
        /* splice the given value at the strIndex position within the
        text of block[blockIndex] */


        let text = this.session.blocks[blockIndex].text
            // slice the string at the index of of start/end.
            , start = text.slice(0, strIndex)
            , end = text.slice(strIndex-1)
            // this is faster than an array join
            , newText = text.substr(0, strIndex) + value + text.substr(strIndex)
            ;

        console.log('add text to block', blockIndex)
        this.updateBlock(blockIndex, newText)
    }


    updateBlock(index, text, meta){
        /* update the block of given index with the new text.*/
        this.session.blocks[index].text = text;
    }

    insertLines(e){
        /* inset multiple lines into a the existing blocks. Additional blocks
        will be created.
        */

        if(e.lines.join('').length == 0) {
            return this.insertReturn(e)
        }

        console.log('insertLines')

        // skip first line, inject new lines
        for (var i = 0; i < e.lines.length; i++) {
            let line = e.lines[i];
            let block = this.session.blocks[i];
            if(block == undefined) {
                console.log('Detect append to end')
                this.session.blocks.push({ text: line })
            } else if(e.start.column == 0
                && line == block.text) {
                console.log('detect line replacement.')
            } else {
                debugger
                // this.injectTextInBlock(i, e.start.column, line)
            }

        };

        debugger

    }

    insertReturn(e) {
        /* the return carriage is detected. a new line is inserted
        at the position of the event */
        let c = this.splitBlockAtIndex(e.start.row, e.start.column)
        console.log('inserted enter key', c)
    }

    splitBlockAtIndex(blockIndex, strIndex) {
        /* split the block into two blocks, the second block indexed under the blockIndex*/
        let text = this.session.blocks[blockIndex].text;
        let startL = text.slice(0, strIndex)
        let endL = text.slice(strIndex)
        this.updateBlock(blockIndex, startL)
        return this.insertBlockAt(blockIndex + 1, this.asBlock(endL))
    }

    asBlock(text) {
        return {
            text: text
        }
    }

    insertBlockAt(index, block) {
        /* Push a single block into the given index position */
        return this.insertBlocksAt(index, [block])
    }

    insertBlocksAt(index, blocks) {
        /* insert many blocks into the block list
        returns the new blocks length*/
        console.log('block insert at:', index, blocks.length)
        this.session.blocks.splice(index, 0, ...blocks)
        return this.session.blocks.length
    }
}


TextSessionWorker.mount()
