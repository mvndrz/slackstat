# slackstat
*Run analytics on your team's Slack usage.*

A simple node.js server that retrieves data from Slack and blasts it into a Postgres DB.




## Get your Slack data

1. Get the Slackstat code!
1. Set up a Heroku instance with a Postgres DB
1. Create a Slack [Legacy Token](https://api.slack.com/custom-integrations/legacy-tokens) for your app to use
1. Create a `.env` file in the Slackstat root directory, like so:
  ```
  SLACK_TOKEN=asdf-2309482304928
  DATABASE_URI=postgres://u:pw@domain:port/dir
  ```
  The database URI can be retrieved from the *Database Credentials* section of your Heroku Postgres DB.
1. Run `heroku local web`
1. Dial your web browser to `http://localhost:5000`
1. You should see a JSON response in your browser


Now, to populate your database:  Drive your browser to [http://localhost:5000/load_all_channels]().  This will run for a while, but when it is done, you will have all of your message history in your database.  

## Connect your analytics tool
We use [Periscope](https://www.periscopedata.com/), which makes it easy to build great visual dashboards with simple SQL queries.  Plug your tool into your Heroku Postgres DB, and get to analyzing.



## Supported endpoints

Endpoint | Usage
---|---
**[/ _(root)_](http://localhost:5000/)** | Retrieves per-channel message counts in the database
**[/users](http://localhost:5000/users)** | Gets JSON of user data
**[/channels](http://localhost:5000/channels)** | Gets JSON of channel data
**[/get_recent/CHANNEL](http://localhost:5000/get_recent/general)** | Gets JSON of recent messages for CHANNEL
**[/load_channel/CHANNEL](http://localhost:5000/load_channel/general)** | Gets new messages for CHANNEL and stores in DB
**[/load_all_channels](http://localhost:5000/load_all_channels)** | Loads new messages from all channels into the database
**[/delete_for_channel/CHANNEL](http://localhost:5000/delete_for_channel/general)** | Deletes messages for CHANNEL from the DB _(call **load_channel** to reload)_









