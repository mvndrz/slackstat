//
// the intersection of slack and db
//
const Slack = require('./slack.js');
const Db = require('./db.js');


function store_messages_from_channel_in_range(channel, min_ts, max_ts, users, success, failure) {
	Slack.get_messages(channel, min_ts, max_ts, users, function (messages) {
			success(messages.length)
		},
		function batch_success(messages) {
			Db.add_messages(messages, function(result) {
			});
		}
	)
}


exports.store_new_messages_for_channel = (channel, users, success, failure) => {

	Db.get_channel_min_max_tss(channel.id, function(min_ts, max_ts) {
		if (min_ts || max_ts) {
			//
			// we presume the existing records in the db are contiguous.  In this case
			// we get before the oldest and after the newest
			//
			store_messages_from_channel_in_range(channel, null, min_ts, users, function(messages_before) {
				store_messages_from_channel_in_range(channel, max_ts, null, users, function(messages_after) {
          var str = channel.name+": loaded "+messages_before+" before "+min_ts+" and "+messages_after+" after "+max_ts;
          console.log(str)
					success(str)
				});
			});
		} else {
			//
			// no records - get everything
			//
			store_messages_from_channel_in_range(channel, null, null, users, function(messages_count) {
        var str = channel.name+": loaded "+messages_count+" messages"
        console.log(str)
        success(str)
			});
		}
	})
}
