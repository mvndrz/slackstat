var pg = require('pg');
pg.defaults.ssl = true;

var env_var = {
	db_url: process.env.DATABASE_URL
};

var db_client = null;

pg.connect(env_var.db_url, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas');
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
    console.log(error)
    failure(error)
  });
}

exports.add_messages = (messages, success, failure) => {

  var column_string = "(channel_id,channel_name,user_id,user_name,ts,tss)";
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
      m.ts
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
    console.log("Inserted "+result.rowCount+" of "+messages.length+" rows")
    success(result)
  }).on("error", function(error) {
    console.log('add_messages error')
    console.log(error)
    if (failure) { failure(error) }
  });
}
