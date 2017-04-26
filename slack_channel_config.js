



exports.get_extra_data_for_channel_message = (channel_name, m) => {

  var config = {
    standup: function (m) {
      if (m.username && m.subtype == "bot_message") {
        return m.username;
      }
    }

  }

  return config[channel_name] ? config[channel_name](m) : null;
}
