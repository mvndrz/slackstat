//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var qs = require('querystring');

const Util = require('./util.js');
const Slack = require('./slack.js');
const Db = require('./db.js');
const SlackDb = require('./slackdb.js');

//set up heroku environment variables
var env_var = {
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

  Slack.get_channels_and_users(function(ch, users) {

    var results = []
    var channels = Object.values(ch).sort(function(a,b) {return (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0);} );

    function load_next() {
      var channel = channels.pop();

      if (channel) {
        SlackDb.store_new_messages_for_channel(channel, users, function(msg) {
          if (msg) { results.push(msg); }
          load_next();
        })

      } else {
        res.send(results.length > 0 ? results : "No new messages for any channel")
        console.log("load_all_channels complete")
      }

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
