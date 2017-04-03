# drizzle

`drizzle` is a bot that Tweets out random Drake lyrics at [@more_drizzle](https://twitter.com/more_drizzle) upon execution, because what better way to brighten up your day than with a little Drizzy?!

This Node script makes authorized requests to the [Genius API](https://docs.genius.com/) to pull the currently highest rated Drake songs by popularity. It then selects a random song, filtering out all featuring artists' lyrics to ensure we focus only on the 6 God's words, and selects 2 random bars. The API's response is also scraped for a Spotify link, which (if found) is appended to the end of the lyrics selected. The result is then sent out as a Tweet to the bot account defined in the script.

## LOCAL SETUP ##

After cloning the repo, run `npm install` to pull all dependencies. Afterwards, `config.json` should be created in the root of the project (based on example structure found in `config.json.ex`) with your designated Twitter bot account's client secret + access token. A Genius access token must also be generated and added.

Finally, run `npm start` and your bot should have spoken! This script can be automated trivially via cronjobs or any other schedule-based automation tool.

A `fabfile.py` and `requirements.txt` can also be found, along with another example structure in `settings.py.ex`. This was configured to help me deploy changes easily to my personal server and are not required to run the project.
