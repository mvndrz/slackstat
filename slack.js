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



exports.get_messages = (channel, oldest_ts, latest_ts, users, success, batch_success) => {
  var messages = [];
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
        if (body.ok) {
          var batch_messages = [];

          batch_count = batch_count-1;

          if (body.messages.length <= 0) {
            latest_ts = 0
          } else {
            latest_ts = body.messages.last().ts;

            body.messages.forEach(function(m) {

              batch_messages.push({
                user_id: m.user,
                user_name: (users[m.user] ? users[m.user].real_name : "unknown"),
                ts: m.ts,
                channel_id: channel.id,
                channel_name: channel.name
              });
            });

            messages = messages.concat(batch_messages)

            console.log(batch_messages.length +
              " messages retrieved.  Oldest timestamp: "+latest_ts+
              "  Total: "+messages.length);

            if (batch_success) {
              batch_success(batch_messages);
            }

          }


          if (body.has_more && batch_count != 0)  {
            get_message_batch();
          } else {
            success(messages);
          }

        } else {
          console.log(error);

        }


      });
  }

  get_message_batch();

}
