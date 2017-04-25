//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var qs = require('querystring');

const Slack = require('./slack.js');
const Db = require('./db.js');
const SlackDb = require('./slackdb.js');

//set up heroku environment variables
var env_var = {
};


if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};




//Server Details
var app = express();
var port = process.env.PORT || 3000;

//Set Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));





//Routes
app.get('/', function(req, res){
  Db.messages_info(function(result) {
    res.send(result);
  });
});

app.get('/users', function(req, res){
  Slack.get_users(function(users) {
    res.send(users);
  });
});



app.get('/channels', function(req, res){
  Slack.get_channels(function(channels) {
    res.send(channels);
  });
});






app.get(/\/data\/(.+)/, function(req, res){
  var table_name = req.params[0];

  Db.get_data(table_name, function(data) {
    res.send(data);
  })
});



app.get(/\/check_messages\/(.+)/, function(req, res){
  var channel_name = req.params[0];

  Slack.get_channels_and_users(function(channels, users) {
    var channel = channels[channel_name]

    Slack.get_messages(channel, null, null, users, function(messages) {
      res.send(messages);
    })
  });

});


app.get(/\/get_recent\/(.+)/, function(req, res){
  var channel_name = req.params[0];

  Slack.get_channels_and_users(function(channels, users) {
    var channel = channels[channel_name]
    if (!channel) {
      res.send("invalid channel '"+channel_name+"'")
    }

    Slack.get_recent_for_channel(channel, function(data) {
      res.send(data)
    })

  });

});



app.get(/\/load_channel\/(.+)/, function(req, res){
  var channel_name = req.params[0];

  Slack.get_channels_and_users(function(channels, users) {
    var channel = channels[channel_name]
    if (!channel) {
      res.send("invalid channel '"+channel_name+"'")
    }

    SlackDb.store_new_messages_for_channel(channel, users, function(msg) {
      res.send(msg || "No new messages for "+channel_name)
    })

  });

});


app.get(/\/load_all_channels/, function(req, res){

  Slack.get_channels_and_users(function(channels, users) {

    var results = []
    channels = Object.values(channels).sort();

    function load_next() {
      var channel = channels.pop();
      SlackDb.store_new_messages_for_channel(channel, users, function(msg) {

        if (msg) { results.push(msg); }

        if (channels.length > 0) {
          load_next();
        } else {
          res.send(results.length > 0 ? results : "No new messages for any channel")
        }
      })
    }
    load_next();


  });

});


app.get(/\/delete_for_channel\/(.+)/, function(req, res){
  var channel_name = req.params[0];

  Db.delete_messages_for_channel(channel_name, function(data) {
    res.send(data);
  })
});




//Start Server
app.listen(port, function () {
  console.log('Listening on port ' + port);
});
