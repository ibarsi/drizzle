/* -------------------------------------------------------
    INDEX
-------------------------------------------------------- */
const Twitter = require('twit');

const logger = require('./logger');
const { Genius, GENIUS_ARTISTS } = require('./genius');
const { Auth } = require('../config.json');

const genius = Genius();
const twitter = new Twitter(Auth.Twitter);

logger.info('=== START ===');

genius.getSongsByArtistId(GENIUS_ARTISTS.DRAKE)
    .then(songs => {
        if (!songs || !songs.length) { return; }

        logger.info(`Songs found: ${ songs.length }`);

        const random_song = songs[ Math.floor(Math.random() * songs.length) ];

        return genius.getSongById(random_song.id);
    })
    .then((song = {}) => {
        if (!song) { return; }

        logger.info(`Song picked: ${ song.full_title }`);

        const { primary_artist = {}, featured_artists = [], fact_track: { external_url } = {} } = song;

        const artist = [ ...featured_artists, primary_artist ]
                .find(({ id }) => id === GENIUS_ARTISTS.DRAKE);

        return genius.getLyricsBySong(song)
            .then(lyrics => {
                if (!lyrics) { return; }

                const artist_lyrics = genius.filterLyricsByArtist(lyrics, artist);

                const pair_bar_indexes = [
                    ...Array(artist_lyrics.length).keys()
                ].filter(x => x < artist_lyrics.length - 2 && x % 2 === 0);

                const random_pair_bar_index = pair_bar_indexes[ Math.floor(Math.random() * pair_bar_indexes.length) ];

                const first_line = artist_lyrics[ random_pair_bar_index ];
                const second_line = artist_lyrics[ random_pair_bar_index + 1 ];

                return first_line && second_line ? `${ first_line }\n${ second_line }\n${ external_url || '' }` : undefined;
            });
    })
    .then(tweet => {
        if (!tweet) { return; }

        logger.info(`Tweet: ${ tweet }`);

        twitter.post('statuses/update', { status: tweet },
            error => {
                if (error) { logger.error(error) }

                logger.info(`Tweet sent successfully!`);
            });
    })
    .catch(logger.error);
