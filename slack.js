const SlackChannelConfig = require('./slack_channel_config.js');
var request = require('request');

var env_var = {
  slack_token: process.env.SLACK_TOKEN
};


exports.get_users = (success,failure) => {
  request.post({
      url: "https://slack.com/api/users.list",
      json: true,
      qs: {
        token: env_var.slack_token
      }
    },
    function handle_get_users(error, response, body){
      if (body.ok) {

        var user_hash = body.members.reduce(function(map, obj) {
          map[obj.id] = obj;
          return map;
        }, {});

        console.log("Loaded "+body.members.length+" users")
        success(user_hash)
      } else {
        console.log("get_users error");
        console.log(error);
        failure(error);
      }
    }
  );
}


exports.get_channels = (success,failure) => {
  request.post({
      url: "https://slack.com/api/channels.list",
      json: true,
      qs: {
        token: env_var.slack_token
      }
    },
    function handle_get_channels(error, response, body){
      if (body.ok) {
        var channels_hash = body.channels.reduce(function(map, obj) {
          map[obj.name] = obj;
          return map;
        }, {});

        console.log("Loaded "+body.channels.length+" channels")
        success(channels_hash)
      } else {
        console.log("get_channels error");
        console.log(error);
        failure(error);
      }
    }
  );
}

exports.get_channels_and_users = (success, failure) => {
  exports.get_channels(function(channels) {
    exports.get_users(function(users) {
      success(channels, users);
    })
  })
}


exports.get_recent_for_channel = (channel, success) =>  {
  var params = {
    token: env_var.slack_token,
    channel: channel.id,
    count: 20
  }

  request.post({
      url: "https://slack.com/api/channels.history",
      json: true,
      qs: params
    },
    function(error, response, body){
      if (body.ok) {
          success(body);
      } else {
        console.log("get_recent_for_channel error");
        console.log(error);
      }
    });
}


exports.get_messages = (channel, oldest_ts, latest_ts, users, success, batch_success) => {
  var messages_count = 0;
  var batch_size = 100;
  var batch_count = -1;

  function get_message_batch() {
    request.post({
        url: "https://slack.com/api/channels.history",
        json: true,
        qs: {
          token: env_var.slack_token,
          channel: channel.id,
          count: batch_size,
          latest: latest_ts,
          oldest: oldest_ts
        }
      },
      function(error, response, body){
        if (body && body.ok) {
          var batch_messages = [];

          if (batch_count > 0) {
            batch_count = batch_count-1;
          }

          if (body.messages.length > 0) {
            latest_ts = body.messages.last().ts;

            body.messages.forEach(function(m) {

              batch_messages.push({
                user_id: m.user,
                user_name: (users[m.user] ? users[m.user].real_name : "unknown"),
                ts: m.ts,
                channel_id: channel.id,
                channel_name: channel.name,
                extra_data: SlackChannelConfig.get_extra_data_for_channel_message(channel.name, m)
              });
            });

            messages_count += batch_messages.length

            if (batch_success) {
              batch_success(batch_messages);
            }

          }


          if (body.has_more && batch_count != 0)  {
            get_message_batch();
          } else {
            success(messages_count);
          }

        } else {
          console.log("get_messages error");
          console.log(error);

        }


      });
  }

  get_message_batch();

}
