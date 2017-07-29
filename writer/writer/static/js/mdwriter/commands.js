(function(){

let main = function() {

    //console.log('updating commands')

    markdownEditorConfig.commands = commands
    markdownEditorConfig.intelliKeys = intelliKeys
}

commands = {
    bold: {
        name: 'bold'
        , bindKey: {win: 'Ctrl-B',  mac: 'Command-B'}
        , insert: "**|**"
        , reverse: true
        , icon: 'format_bold'
    }

    , italic: {
        name: 'italic'
        , bindKey: {win: 'Ctrl-I',  mac: 'Command-I'}
        , insert: "_|_"
        , reverse: true
        , icon: 'format_italic'
    }

    , strikethrough: {
        name: 'strikethrough'
        , bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'}
        , insert: "~~|~~"
        , reverse: true
        , icon: 'strikethrough_s'
    }

    , link: {
        name: 'link'
        , bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'}
        , insert: "[|](url)"
        , reverse: true
        , icon: 'link'
    }

    , bullet: {
        name: 'bullet_point'
        , insert: '+ |'
        , reverse: true
        , icon: 'format_list_bulleted'
    }

    , numbered: {
        name: 'numbered_point'
        , insert: '1. |'
        , reverse: true
        , icon: 'format_list_numbered'
    }


    , attach_file: {
        name: 'attach_file'
        , insert: '[FILE] |'
        , icon: 'attach_file'
        , click(){
            bus.$emit('attachment-modal', {
                actionCallback(result, event) {
                    console.log('attachment', result)
                }
            })
        }
    }
};

intelliKeys = {
}

main()

})()
