/* -------------------------------------------------------
    INDEX
-------------------------------------------------------- */
const Twitter = require('twit');

const logger = require('./logger');
const { Genius, GENIUS_ARTISTS } = require('./genius');
const { AUTH, MAX_RETRY_COUNT } = require('../config.json');

const genius = Genius();
const twitter = new Twitter(AUTH.Twitter);

const retry = (() => {
    let counter = 0;

    return function (stage) {
        if (counter >= MAX_RETRY_COUNT) {
            logger.error(`ERROR - Retried ${ counter } times. Stopping due to too many errors.`);
            return;
        }

        logger.info(`WARN - Failed to Tweet Drake lyrics at ${ stage } stage. Retrying ${ ++counter } time(s)...`);
        start();
    };
})();

logger.info('=== START ===');

async function start() {
    try {
        const songs = await genius.getSongsByArtistId(GENIUS_ARTISTS.DRAKE);

        if (!songs || !songs.length) { retry('songs'); return; }

        logger.info(`Songs found: ${ songs.length }`);

        const random_song = songs[ Math.floor(Math.random() * songs.length) ];

        const full_song = await genius.getSongById(random_song.id);

        if (!full_song) { retry('full_song'); return; }

        logger.info(`Song picked: ${ full_song.full_title }`);

        const { primary_artist = {}, featured_artists = [], fact_track: { external_url } = {} } = full_song;

        const artist = [ ...featured_artists, primary_artist ]
                .find(({ id }) => id === GENIUS_ARTISTS.DRAKE);

        const lyrics = await genius.getLyricsBySong(full_song)

        if (!lyrics) { retry('lyrics'); return; }

        const artist_lyrics = genius.filterLyricsByArtist(lyrics, artist);
        const [ first_line, second_line ] = genius.getRandomBarFromLyrics(artist_lyrics);

        const tweet = first_line && second_line ? `${ first_line }\n${ second_line }\n${ external_url || '' }` : undefined;

        if (!tweet) { retry('tweet'); return; }

        logger.info(`Tweet: ${ tweet }`);

        twitter.post('statuses/update', { status: tweet },
            error => {
                if (error) { logger.error(error) }

                logger.info(`Tweet sent successfully!`);
            });
    } catch (error) {
        logger.error(error);
    }
}

start();
