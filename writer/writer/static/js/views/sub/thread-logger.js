Vue.component('thread-message', {
    template: `<div :class="['thread-message', message.name]">{{ message }}</div>`
    , props: ['message']
})

Vue.component('thread-removeLine', {
    template: `<div :class="['thread-removeLine', message.name]">
        <span class="row">{{ message.content.blockIndex }}</span>
        <span class="column">{{ message.content.start }}</span>
        <span class="value">{{ message.content.length }}</span>
    </div>`
    , props: ['message']
})

Vue.component('thread-insertLine', {
    template: `<div :class="['thread-insertLine', message.name]">
        <span class="row">{{ message.content.blockIndex }}</span>
        <span class="column">{{ message.content.start }}</span>
        <span class="value">{{ message.content.value }}</span>
    </div>`
    , props: ['message']
})

Vue.component('thread-error', {
    template: `<div :class="['thread-error', message.name]">
        <span class="column">{{ message.content.errStr }}</span>

    </div>`
    , props: ['message']
})

Vue.component('thread-undefinedBlockIndex', {
    template: `<div :class="['thread-undefined', message.name]">
        <span class="column">Generating new block at missing index {{ message.content.blockIndex }}</span>

    </div>`
    , props: ['message']
})

Vue.component('thread-logger', {
    template: `<div class="thread-log">
        <div :class="['log-container', { counterMultiplier: counterMultiplier > 1}]" >
            <h4 class="header">Thread Log
                (<span class="count">{{ counter }}</span>)
            </h4>


            <ul class="loglets" ref='loglets'>
                <li class="loglet max-clear" v-show='counterMultiplier > 1'>
                    {{ max *  (counterMultiplier - 1) }} messages hidden
                </li>
                <li class="loglet" v-for='loglet in loglets'>
                    {{ loglet }}
                </li>
            </ul>
            <ul class="messages-header">
                <li class="message-placer">
                    <span class="row">Row</span>
                    <span class="column">Column</span>
                    <span class="value">Value</span>
                </li>
            </ul>
            <ul class="messages" ref='messages'>

                <li class="message" v-for='message in messages'>
                    <div class="message-placer" :message='message' :is='messageType(message)'></div>
                </li>
            </ul>
        </div>
    </div>
    `

    , data() {
        return {
            messages: [ 'log message']
            , max: 100
            , counter: 0
            , counterMultiplier: 1
            , stackStore: []
            , loglets: []
        }
    }

    , created(){
        bus.$on('log', this.logHandle.bind(this))
        bus.$on('log-clear', this.clear.bind(this))
        bus.$emit('log-attach', { logUpdate: this.logHandle.bind(this) })
    }

    , methods: {
        logHandle(d){
            return this.add(d)
        }

        , messageType(message) {
            let n = `thread-${message.type}`
            if(n in Vue.options.components){
                return n
            }
            return 'thread-message'
        }

        , clear(){
            this.messages = []
        }

        , storeClear(){
            this.stackStore.push(this.messages.slice());
            this.counterMultiplier++;

            this.clear()
        }

        , add(d) {
            let $m = this.$refs.messages

            let stackcount = (this.counterMultiplier -1) * (this.max + 1)
            this.counter = this.messages.length + stackcount
            if(this.messages.length > this.max) {
                this.storeClear()
            };

            this.messages.push(d)
            this.$nextTick(function(){
                $m.scrollTop = $m.scrollHeight
            })
        }
    }
})


