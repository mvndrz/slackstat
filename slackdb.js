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

  console.log("store_new_messages_for_channel: "+channel.name)
  Db.get_channel_min_max_tss(channel.id, function(min_ts, max_ts) {

    function complete_load(m_old, m_new) {
      var str = null
      if (m_old && m_new) {
        str = " - "+channel.name+": loaded "+m_old+" old and "+m_new+" new messages";
        console.log(str)
      } else if (m_old) {
        str = " - "+channel.name+": loaded "+m_old+" new messages";
        console.log(str)
      } else {
        console.log(" - "+channel.name+": no new messages")
      }
      success(str)
    }

    if (min_ts && max_ts) {
      store_messages_from_channel_in_range(channel, null, min_ts, users, function(m_old) {
        store_messages_from_channel_in_range(channel, max_ts, null, users, function(m_new) {
          complete_load(m_old, m_new)
        });
      });
    } else {
      store_messages_from_channel_in_range(channel, null, null, users, function(m) {
        complete_load(m)
      });
    }

  })
}
