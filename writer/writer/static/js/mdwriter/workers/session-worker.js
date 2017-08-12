/*
Manage the line alterations of the editor. Each event captured from the
receiver manipulates the block contents. Each block maps to a line within the
editor.

Blocks are managed internally from a given start Text.
*/

class BlockManager extends ManagerComponent {

    replaceBlock(blockIndex, newBlock) {
        this.insertBlockAt(blockIndex+1, newBlock)
        this.aLog('replaceBlock', {blockIndex , newBlock })
        return this.removeLineAt(blockIndex)
    }

    splitLineAtIndex(blockIndex, strIndex) {
        /* split the block into two blocks, the second block indexed under the blockIndex*/
        if(this.session.blocks[blockIndex] == undefined){
            return false;
        }

        let text = this.session.blocks[blockIndex].text;
        if(text == undefined) return false;

        this.aLog('splitLineAtIndex', {blockIndex, strIndex})

        this.updateLineText(blockIndex, text.slice(0, strIndex))
        return this.insertBlockAt(blockIndex + 1, this.asBlock(text.slice(strIndex)))
    }

    spliceBlockText(blockIndex, startIndex, endIndex) {
        /* remove the substring from the block text from startIndex to endIndex */
        let text = this.getBlockText(blockIndex);
        let start = text.substr(0, startIndex);
        let end = text.substr(endIndex);
        this.aLog('spliceBlockText', {blockIndex, startIndex, endIndex})
        return this.updateLineText(blockIndex, start + end);
    }

    getBlockText(blockIndex) {
        if(this.session.blocks[blockIndex] == undefined)  {
            return
        };
        return this.session.blocks[blockIndex].text;
    }

    mergeBlockDown(blockIndex) {
        /* Merge the target block index into the next block below.*/
        if(this.session.blocks[blockIndex] == undefined){
            return false;
        }

        let ta = this.session.blocks[blockIndex].text;
        let tb = this.session.blocks[blockIndex + 1].text;

        this.aLog('mergeBlockDown', {blockIndex})
        this.updateLineText(blockIndex, ta + tb)
        return this.removeLineAt(blockIndex+1)
    }

    asBlocks(texts) {
        /* givwen an array of strings, return an array of blocks */
        let r = []
        for (var i = 0; i < texts.length; i++) {
            r.push(this.asBlock(texts[i]))
        };
        return r;
    }

    asBlock(text) {
        /* return the given text as a block item */
        return {
            text: text
        }
    }

    updateLineText(index, text, meta){
        /* update the block of given index with the new text.*/
        this.aLog('updateLineText', {blockIndex: index, textLength: text.length })
        this.session.blocks[index].text = text;
    }

    insertBlockAt(index, block) {
        /* Push a single block into the given index position */
        return this.insertBlocksAt(index, [block])
    }

    insertBlocksAt(index, blocks) {
        /* insert many blocks into the block list
        returns the new blocks length*/
        this.aLog('insertBlocksAt', {blockIndex: index, count: blocks.length})

        this.session.blocks.splice(index, 0, ...blocks)
        return this.session.blocks.length
    }

    removeBlock(block) {
        let index = this.session.blocks.indexOf(block)
        if(index == -1) {
            return false;
        };

        return this.removeLineAt(index)
    }

    removeLineAt(index) {
        this.aLog('removeLineAt', {blockIndex: index})
        return this.session.blocks.splice(index, 1)
    }

    removeLineRange(startRow, endRow) {
        let removes = this.session.blocks.slice(startRow, endRow);
        //console.log('Remove blocks:', removes.map((x)=>x.text))
        for (var i = 0; i < removes.length; i++) {
            this.removeBlock(removes[i])
        }

        return removes;
    }

    replaceAsLines(linesArray) {

        let blocks = []
        for (var i = 0; i < linesArray.length; i++) {
            blocks.push(this.asBlock(linesArray[i]))
        }

        return this.replaceAsBlocks(blocks)
    }

    replaceAsBlocks(blocks) {
        this.aLog('replaceAsBlocks', { count: blocks.length })
        this.session.blocks = blocks
    }

}


class InsertTextBlockManager extends BlockManager {

    insertActionEvent(e) {
        /* From here we manage the text session, page updates denote
        any extra meta data required for running the
        page context. */
        this.session.events.push(e)

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
            //, eCol = e.end.column
            , value = e.lines[0]

        this.aLog('insertLine', { blockIndex, start: sCol, value })
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
            this.updateLineText(e.start.row, newText)
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
            this.insertBlocksAt(e.end.row + dupIndex + 1, endRows)
            return
        }

        return this.insertBlocksAt(e.start.row+1, midLines)
    }

    injectTextInBlock(blockIndex, strIndex, value) {
        /* splice the given value at the strIndex position within the
        text of block[blockIndex] */

        if(this.session.blocks[blockIndex] == undefined) {
            this.eLog(`Cannot inject value into undefined block: ${blockIndex}`)
            return this.undefinedBlockIndex(blockIndex, strIndex, value)
        }

        let text = this.session.blocks[blockIndex].text
            // slice the string at the index of of start/end.
            , start = text.slice(0, strIndex)
            , end = text.slice(strIndex-1)
            // this is faster than an array join
            , newText = text.substr(0, strIndex) + value + text.substr(strIndex)
            ;

        this.updateLineText(blockIndex, newText)
    }

    undefinedBlockIndex(blockIndex, strIndex, value) {
        this.bLog('undefinedBlockIndex', { blockIndex, strIndex, value })
        this.session.blocks[blockIndex] = this.asBlock(value)
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
                break;
            }
        };

        return [isMatch, endRows, dupIndex];
    }

    insertReturn(e) {
        /* the return carriage is detected. a new line is inserted
        at the position of the event */
        let c = this.splitLineAtIndex(e.start.row, e.start.column)
    }
}


class RemoveTextBlockManager extends InsertTextBlockManager {

    removeActionEvent(e) {
        /* From here we manage the text session, page updates denote
        any extra meta data required for running the
        page context. */
        this.session.events.push(e)
        if(e.start.row == e.end.row) {
            this.removeLine(e)
        } else {
            this.removeLines(e)
        };
    }

    removeLine(e) {
        /* single line remove event has occured such as a char.*/
        let text = this.getBlockText(e.start.row);
        let line = e.lines[0];
        this.aLog('removeLine', { blockIndex: e.start.row, start: e.start.column, length:e.start.column + line.length })

        if(text != undefined) {
            let delString = text.substr(e.start.column, line.length);
            if(delString != line) { return false };
            this.spliceBlockText(e.start.row, e.start.column, e.start.column + line.length)
        }

        return true;
    }

    removeLines(e){

        if(e.lines.join('').length == 0) {
            return this.removeReturn(e)
        }

        // splice top and bottom; delete middle lines
        let startRow = e.start.row
        let endRow = e.end.row
        let text = this.getBlockText(startRow);
        let endText = '';

        if(this.session.blocks[endRow] != undefined)  {
            endText = this.getBlockText(endRow);
        } else {

        }

        let startLine = text.slice(0, e.start.column);
        let lastLine = endText.slice(e.end.column, endText.length);
        this.updateLineText(startRow, startLine + lastLine);
        // remove block for all rows.
        this.removeLineRange(startRow + 1, endRow + 1)
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
            , blocks: []
        }

        this.methodOnRPC('getLines', this.getLines.bind(this))
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

    setLinesEvent(event) {
        /* Automatically hooked to the testText event, capture the meta data for any incoming changes.*/
        // console.log('TextSessionWorker setLinesEvent', event)
        this.replaceAsLines(event.data);
    }

    setPageEvent(page){
        console.log('TextSessionWorker set page', page)
        // this.session.page = page
        this.replaceAsLines(page.data.lines);

    }

    getLines(){
        return this.session.blocks.map((v)=>v.text)
    }

}


TextSessionWorker.mount('changes')



