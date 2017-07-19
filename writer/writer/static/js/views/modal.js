var standardModal = function(config={}) {
   // debugger
    let conf = {}

    let animateShow = function(popup){
        let $popup = $(popup);

        $popup
            .addClass('animate-in')
            .removeClass('animate-flag')
            ;

        setTimeout(function(){
            $popup
                .addClass('animate-done')
                .removeClass('animate-in')
        }, 1010);
    }

    let defaultConfig = {
        selector: '.templates .standard-modal-container'
        , containerClass: 'standard-modal-container gravel-container animate-flag'
        , modalColor: '#000'
        , buttons: [
            {
                label: 'no'
                , color: '#d3dbe6'
                , classes: 'close-button'
                , callback: function(e){
                    conf.actionCallback && conf.actionCallback(false, e)
                    if(!conf.actionCallback) {
                        this.close()
                    }
                }
            }
            , {
                label: 'yes'
                , callback: function(e){
                    conf.actionCallback && conf.actionCallback(true, e)
                }
                , position:'right'
                , color: '#0089ec'
            }
        ]
        , id: Math.random().toString(32).slice(2)
        , data: config
        , onShow() {
            let g = popup.data().gravel._popup;

            animateShow(g)
        }
    }

    Object.assign(conf, defaultConfig, config);
    let popup = $(conf.selector).gravel(conf);

    return popup.data('gravel');
};

var bookmarkModal = function(parent, link, actionCallback){
    if(actionCallback == undefined && IT.g(link).is('function')) {
        actionCallback = link;
        link = undefined
    };

    let url = '', name ='', id=''

    var defaultLink = { url, name, id };

    let _group = link == undefined ? '': link.group;

    parent.$popup = $('.templates .add-link-modal-container').gravel({
        id: Math.random().toString(32).slice(2)
        , link: link == undefined? defaultLink: link
        , containerClass: 'gravel-container animate-flag'
        , modalColor: '#000'

        , buttons: [
            {
                label: 'close'
                , color: '#d3dbe6'
                , classes: 'close-button'
            }
            , {
                label: 'delete'
                , classes: 'delete-button hidden'
                , callback: function(e){
                    actionCallback && actionCallback('delete', e)
                }
                , color: '#880000'
            }
            , {
                label: 'save'
                , callback: function(e){
                    actionCallback && actionCallback('save', e)

                }
                , position:'right'
                , color: '#0089ec'
            }
        ]

        , onShow(){

            window.setTimeout(function(){
                var g = parent.$popup.data().gravel;
                parent.activeModal = g
                let el = $(g._popup).find('.groups')[0];

                // This is an issue; Gravel will copy the original title
                // content and use it within the title div.
                // Vue requires an unedited template in place of the gravel
                // copy.
                // Copy the original content (unedited) into the presented location,
                // Then Vue the presented title.
                let titleEl = $(g._popup).find('.add-link-modal .gravel-title')[0];
                let presTitleEl = $(g._popup).find('.gravel-title.title')
                presTitleEl.html(titleEl);

                let titleVue = new Vue({
                    el: presTitleEl[0]
                    , data: {
                        link: link
                    }


                    , methods: {
                        animateIn(){

                            $(g._popup)
                                .addClass('animate-in')
                                .removeClass('animate-flag')

                            setTimeout(function(){

                                $(g._popup)
                                    .addClass('animate-done')
                                    .removeClass('animate-in')
                            }, 1010)
                        }
                    }

                    , mounted(){
                        //let ta = $(g._popup).find('input.url');
                        // autosize(ta)
                        if(this.link != undefined) {
                            $(g._popup).find('.delete-button').removeClass('hidden')
                            $(g._popup).find('.close-button').addClass('hidden')
                        }
                        setTimeout(this.animateIn.bind(this), 1)
                    }
                })

                // Group selector option dropdown
                let dropVue = new Vue({
                    el: el
                    , data: {
                        groups: bus.groups.result
                        , linkGroup: link == undefined ? '': link.group
                        , link: link
                    }

                    , methods: {
                        isSelected: function(item, raw=false) {
                             return item.id == this.linkGroup
                        }
                    }
                })

                let groupEl = $(g._popup).find('.group-input')[0];
                let groupVue = new Vue({
                    el: groupEl
                    , data: {
                        showNew: false
                    }

                    , methods: {
                        addGroupButton(){
                            this.showNew = !this.showNew
                        }
                    }
                })

                g.reflow()

                $('.gravel option[data-selected]').attr('selected', true)
                $('.gravel select').material_select();
                Materialize.updateTextFields();
            }, 10)
        }
    })

    return parent.$popup
};

bus.standardModal = standardModal;
bus.bookmarkModal = bookmarkModal;
