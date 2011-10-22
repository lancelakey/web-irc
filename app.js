$(function() {

    // MODELS & COLLECTIONS
    // ====================
    var Message = Backbone.Model.extend({
        defaults: {
            sender: '',
            channel: '',
            text: ''
        }
    });

    var Channel = Backbone.Model.extend({
        // expected properties: name
        initialize: function() {
            console.log('Joining ' + this.get('name'));
            socket.emit('join', {name: this.get('name')});
        }
    });

    var ChannelList = Backbone.Collection.extend({
        model: Channel
        
    });

    var Stream = Backbone.Collection.extend({
        model: Message
        
    });

    window.channels = new ChannelList;
    window.stream = new Stream;


    // VIEWS
    // =====
    var MessageView = Backbone.View.extend({

    	render: function() {
            var msg = this.model.get('sender') + ': ' + this.model.get('text');
            $(this.el).html(msg);
            return this;
    	}
    });

    var ChannelView = Backbone.View.extend({
        el: $('.channel'),

        initialize: function() {
            // this.render();
            stream.bind('add', this.add, this);
        },

    	add: function(message) {
           var view = new MessageView({model: message});
           $(this.el).append(view.render().el);
    	},

        render: function() {
            $(this.el).html('<div class="channel"/>');
            return this;
        }

    });

    var ChannelTabView = Backbone.View.extend({
        tagName: 'li',
        initialize: function() {
            this.render();
        },

        events: {
            'click .close': 'leave'
        },

        leave: function() {
            
        },

        render: function() {
            console.log('Rendering channel tab');
            $(this.el).text(this.model.get('name'));
        }
        
    });

    var AppView = Backbone.View.extend({
        el: $('#content'),
        testChannels: $('#sidebar .channels'),
        channelList: $('header .channels'),

        initialize: function() {
            channels.bind('add', this.addTab, this);

        },


        addTab: function(channel) {
            var tab = new ChannelTabView({model: channel});
            this.channelList.append(tab.el);
        },

        joinChannel: function(name) {
            channels.add({name: name});
        }

    });

    var channel = new ChannelView,
        app = new AppView;


    // VERY TEMPORARY -- JUST FOR TESTING
    $('.channels li').click(function() {
        var name = $(this).text();
        app.joinChannel(name);
    });

    $('.channels li .close').click(function() {
        var name = $(this).paren().text();
        console.log('Leaving ' + name);
        socket.emit('leave', {name: name})
    });


    var socket = io.connect('http://localhost');

    socket.on('message', function(obj) {
        console.log(obj);
    	stream.add({sender: obj.from, channel: obj.to, text: obj.message});
    });

});