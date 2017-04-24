//
// the intersection of slack and db
//
const Slack = require('./slack.js');
const Db = require('./db.js');


function store_messages_from_channel_in_range(channel, min_ts, max_ts, users, success, failure) {
  Slack.get_messages(channel, min_ts, max_ts, users, function (messages_count) {
      success(messages_count)
    },
    function batch_success(messages) {
      Db.add_messages(messages, function(result) {
      });
    }
  )
}


exports.store_new_messages_for_channel = (channel, users, success, failure) => {

  Db.get_channel_min_max_tss(channel.id, function(min_ts, max_ts) {
    store_messages_from_channel_in_range(channel, max_ts, null, users, function(messages_count) {
      var str = null
      if (messages_count>0) {
        str = channel.name+": loaded "+messages_count+(max_ts ? " after "+max_ts : "");
        console.log(str)
      }
      success(str)
    });
  })
}
