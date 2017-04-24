# slackstat
Run analytics on your team's Slack usage




##Get your Slack data

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

##Connect your analytics tool
We use [Periscope](https://www.periscopedata.com/), which makes it easy to build great visual dashboards with simple SQL queries.  Plug your tool into your Heroku Postgres DB, and get to analyzing.
