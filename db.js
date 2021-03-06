const pg = require('pg');

pg.defaults.ssl = true;

var env_var = {
  db_uri: process.env.DATABASE_URI
};

var db_client = null;

pg.connect(env_var.db_uri, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres!');
  db_client = client
});


exports.get_data = (table, success, failure) => {
  var query = db_client.query('SELECT * FROM '+table+';');
  query.on("end", function (result) {
    success(result)
  }).on("error", function(error) {
    console.log('get_data error')
    console.log(error)
    failure(error)
  });
}

exports.get_channel_min_max_tss = (channel_id, success, failure) => {
  var query = db_client.query("select min(tss) min_tss, max(tss) max_tss from messages where channel_id = $1;", [channel_id]);
  query.on("end", function (result) {
    if (result.rows.length > 0) {
      success(result.rows[0].min_tss, result.rows[0].max_tss)
    } else {
      success(null, null)
    }
  }).on("error", function (error) {
    console.log('get_channel_min_max_tss error')
    console.log(error)
    failure(error)
  });
}

exports.add_messages = (messages, success, failure) => {

  var column_string = "(channel_id,channel_name,user_id,user_name,ts,tss,extra_data)";
  var params = [];
  var params_labels = [];
  messages.forEach(m => {
    var pl = [];
    [
      m.channel_id,
      m.channel_name,
      m.user_id,
      m.user_name,
      (new Date(parseFloat(m.ts)*1000)).toUTCString(),
      m.ts,
      m.extra_data
    ].forEach(v => {
      params.push(v);
      pl.push('$' + params.length);
    });
    params_labels.push("("+pl.join(',')+")")
  });

  var query_string = 'INSERT INTO messages '+column_string+' values ' +
      params_labels.join(",") + ' ON CONFLICT DO NOTHING;'

  var query = db_client.query(query_string, params);
  query.on("end", function (result) {
    success(result)
  }).on("error", function(error) {
    console.log('add_messages error')
    console.log(error)
    if (failure) { failure(error) }
  });
}

exports.delete_messages_for_channel = (channel_name, success, failure) => {
  var query = db_client.query("DELETE FROM messages WHERE channel_name = $1;", [channel_name]);
  query.on("end", function (result) {
    console.log("Deleted "+result.rowCount+" rows")
    success(result)
  }).on("error", function(error) {
    console.log('delete_messages_for_channel error')
    console.log(error)
    if (failure) { failure(error) }
  });

}

exports.messages_info = (success, failure) => {
  var query = db_client.query("SELECT channel_name, count(*) message_count FROM messages GROUP BY channel_name ORDER BY channel_name");
  query.on("end", function (result) {
    console.log(result)
    success(result)
  }).on("error", function(error) {
    console.log('messages_info error')
    console.log(error)
    if (failure) { failure(error) }
  });

}
