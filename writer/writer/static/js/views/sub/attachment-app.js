/*
General attachment handler for the modal interface handling and
general attachment query functions.
 */
var attachmentApp = new Vue({

    created(){
        /* fetch data about page.*/
        console.log('attachmentApp')
        bus.attachmentApp = this;
        bus.$on('attachment-modal', this.modal.bind(this))
    }

    , methods: {
        modal(config={}){
            /* open and present the attachment modal*/
            attachmentModal(config)
        }

    }
})
