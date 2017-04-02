/* -------------------------------------------------------
    GENIUS
-------------------------------------------------------- */

require('isomorphic-fetch');
const cheerio = require('cheerio');

const config = require('../config.json');

const apis = {
    songs_by_artist: 'https://api.genius.com/artists/{artist}/songs?sort=popularity&page=1&per_page=50',
    song_by_id: 'https://api.genius.com/songs/{id}'
};

const headers = new Headers({
    Accept: 'application/json',
    Authorization: `Bearer ${ config.Auth.Genius.access_token }`
});

const GENIUS_ARTISTS = {
    DRAKE: 130
};

const Genius = () => {
    return {
        getSongsByArtistId(id) {
            if (!id) { return []; }

            const url = apis.songs_by_artist.replace('{artist}', id);

            return fetchJSON(url, { headers })
                .then(({ response: { songs = [] } }) => songs);
        },
        getSongById(id) {
            if (!id) { return; }

            const url = apis.song_by_id.replace('{id}', id);

            return fetchJSON(url, { headers })
                .then(({ response: { song } }) => song);
        },
        getLyricsBySong(song) {
            if (!song) { return; }

            const { url } = song;

            return fetchDOM(url)
                .then($ => {
                    const content = $('.lyrics').text();
                    const lines = content.split('\n').filter(x => Boolean(x.trim()));

                    return lines;
                });
        },
        filterLyricsByArtist(lyrics = [], { name = '' } = {}) {
            return lyrics.reduce((acc, line, index, array) => {
                if (!line.includes(name)) { return acc; }

                const start_index = ++index;
                const end_index = index + array
                    .slice(index)
                    .findIndex(line => line.includes('[') && line.includes(']'));

                return [ ...acc, ...array.slice(start_index, end_index) ];
            }, []);
        }
    }
};

module.exports = {
    Genius,
    GENIUS_ARTISTS
};

// PRIVATE

function fetchJSON(url, options = {}) {
    if (!url) { throw new Error('URL cannot be invalid.') }

    return fetch(url, options)
        .then(response => {
            if (response.status !== 200) { throw new Error(`ERROR: ${ response.status } - ${ response.statusText }`); }

            return response.json()
        });
}

function fetchDOM(url, options = {}) {
    if (!url) { throw new Error('URL cannot be invalid.') }

    return fetch(url, options)
        .then(response => {
            if (response.status !== 200) { throw new Error(`ERROR: ${ response.status } - ${ response.statusText }`); }

            return response.text()
        })
        .then(html => cheerio.load(html));
}
