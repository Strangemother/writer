/*
manage the data session of a page, tracking character entry and page context
 */

class BlockManager extends ManagerComponent {

    replaceBlock(blockIndex, newBlock) {
        console.log('replacing block', blockIndex)
        this.insertBlockAt(blockIndex+1, newBlock)
        return this.removeBlockAt(blockIndex)
    }

    splitBlockAtIndex(blockIndex, strIndex) {
        /* split the block into two blocks, the second block indexed under the blockIndex*/
        let text = this.session.blocks[blockIndex].text;
        this.updateBlockText(blockIndex, text.slice(0, strIndex))
        return this.insertBlockAt(blockIndex + 1, this.asBlock(text.slice(strIndex)))
    }

    mergeBlockDown(blockIndex) {
        /* Merge the target block index into the next block below.*/
        let ta = this.session.blocks[blockIndex].text;
        let tb = this.session.blocks[blockIndex + 1 ].text;
        this.updateBlockText(blockIndex, ta + tb)
        return this.removeBlockAt(blockIndex+1)
    }

    asBlock(text) {
        return {
            text: text
        }
    }

    asBlocks(texts) {
        let r = []
        for (var i = 0; i < texts.length; i++) {
            r.push(this.asBlock(texts[i]))
        };
        return r;
    }

    updateBlockText(index, text, meta){
        /* update the block of given index with the new text.*/
        this.session.blocks[index].text = text;
    }

    insertBlockAt(index, block) {
        /* Push a single block into the given index position */
        return this.insertBlocksAt(index, [block])
    }

    removeBlockAt(index) {
        return this.session.blocks.splice(index, 1)
    }

    insertBlocksAt(index, blocks) {
        /* insert many blocks into the block list
        returns the new blocks length*/
        console.log('block insert at:', index, 'count:', blocks.length)
        this.session.blocks.splice(index, 0, ...blocks)
        return this.session.blocks.length
    }
}


class InsertTextBlockManager extends BlockManager {

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

        console.log('Line count:', this.session.blocks.length)
    }

    insertLine(e){
        /* a single line insert event occured such as a char.
            + find the session block index (should match the event row)
            + Split the line at the position
            + inject new content
        */
        let blockIndex = e.start.row
            , sCol = e.start.column
            //, eCol = e.end.column
            , value = e.lines[0]

        this.injectTextInBlock(blockIndex, sCol, value)
    }

    _firstlineInsert(e) {

        let end = '';

        if(e.start.column == 0) {
            // no need to slice the string; add a line before.
            this.replaceBlock(e.start.row, this.asBlock(e.lines[0]))
        } else {

            let text = this.session.blocks[e.start.row].text
                , strIndex = e.start.column
                // slice the string at the index of of start/end.
                , start = text.slice(0, strIndex)
                // this is faster than an array join
                , newText = text.substr(0, strIndex) + e.lines[0]
                ;
            end = text.slice(strIndex)
            this.updateBlockText(e.start.row, newText)
        }

        return end;
    }

    insertLines(e){
        /* inset multiple lines into a the existing blocks. Additional blocks
        will be created.
        */

        if(e.lines.join('').length == 0) {
            return this.insertReturn(e)
        }

        // the first line
        let end = this._firstlineInsert(e);

        // skip first line, inject new lines
        let midLines = this.asBlocks(e.lines.slice(1, -1));
        // generate the last line
        midLines = midLines.concat(this.asBlock(e.lines[e.lines.length-1] + end))

        let [isMatch, endRows, dupIndex] = this.detectDuplicates(midLines, e.start.row)

        if(isMatch) {
            /* detected the same lines provided to the API*/
            console.log('discovered', endRows.length, 'duplicated')
            this.insertBlocksAt(e.end.row + dupIndex + 1, endRows)
            return
        }

        // debugger;
        console.log('Applying', midLines.length ,'new rows')
        this.insertBlocksAt(e.start.row+1, midLines)

        return;

        // for (var i = 1; i < e.lines.length; i++) {
        //     let line = e.lines[i];
        //     let block = this.session.blocks[i];
        //     if(block == undefined) {
        //         console.log('Detect append to end')
        //         this.session.blocks.push({ text: line })
        //     } else if(e.start.column == 0
        //         && line == block.text) {
        //         console.log('detect line replacement.')
        //     } else {
        //         if(i == 0){
        //             continue
        //         } else if(i == e.lines.length - 1) {
        //             // add a new block as a merge of last line and end line.
        //             line = line + end;
        //         }

        //         this.insertBlockAt(i+1, this.asBlock(line))

        //     }

        // };
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
        this.updateBlockText(blockIndex, newText)
    }

    detectDuplicates(lines, offsetIndex=0) {

        var isMatch = true;
        let endRows = [];
        let dupIndex = 0;
        for (var i = 0; i < lines.length; i++) {
            if(this.session.blocks[offsetIndex+i+1] == undefined) {
                endRows = lines.slice(i)
                dupIndex = i;
                continue
            }

            if (this.session.blocks[offsetIndex+i+1].text != lines[i].text)  {
                isMatch = false;
                console.log('Dup detection stop.')
                break;
            }
        };

        return [isMatch, endRows, dupIndex];
    }

    insertReturn(e) {
        /* the return carriage is detected. a new line is inserted
        at the position of the event */
        let c = this.splitBlockAtIndex(e.start.row, e.start.column)
        console.log('inserted enter key', c)
    }
}


class RemoveTextBlockManager extends InsertTextBlockManager {

    removeActionEvent(e) {
        /* From here we manage the text session, page updates denote
        any extra meta data required for running the
        page context. */
        this.session.events.push(e)
        //console.log('TextSessionWorker insert event', e)
        if(e.start.row == e.end.row) {
            this.removeLine(e)
        } else {
            this.removeLines(e)
        }

        console.log('Line count:', this.session.blocks.length)
    }

    removeLine(e) {
        /* single line remove event has occured such as a char.*/
        let text = this.session.blocks[e.start.row].text;
        if(text.substr(e.start.column, e.lines[0].length) != e.lines[0]) {
            console.log('delete mismismatch')
            return false;
        };

        this.session.blocks[e.start.row].text = text.substr(0, e.start.column) + text.substr(e.start.column + e.lines[0].length)
        return true;
    }

    removeLines(e){
        debugger

        if(e.lines.join('').length == 0) {
            return this.removeReturn(e)
        }

    }

    removeReturn(e){
        this.mergeBlockDown(e.start.row)
    }
}


class TextSessionWorker extends RemoveTextBlockManager {

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

}


TextSessionWorker.mount()



