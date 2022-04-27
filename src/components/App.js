import { useEffect, useState, useRef } from "react";
import { DebounceInput } from "react-debounce-input";
import "../styles/App.css";

import axios from "axios";
import moment from "moment";

import HandleTokenExtraction from "./utils/HandleTokenExtraction";
import HandleTokenExpiration from "./utils/HandleTokenExpiration";
import LogOut from "./utils/LogOut";
import HandleWhitespace from "./utils/HandleWhitespace";
import Key from "./utils/Key";
import Mode from "./utils/Mode";
import MsToMinAndSec from "./utils/MsToMinAndSec";

const REDIRECT_URL = process.env.REACT_APP_URL;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  const [searchKey, setSearchKey] = useState("");
  const [errorApiStatus, setErrorApiStatus] = useState("");
  const [errorApiHelp, setErrorApiHelp] = useState("");
  const [noResultsMsg, setNoResultsMsg] = useState("");
  const [buttonState, setButtonState] = useState(true);

  const [tracks, setTracks] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [songsData, setSongsData] = useState([]);
  const [artistsData, setArtistsData] = useState([]);

  const inputRef = useRef();
  const token = window.localStorage.getItem("token");

  // FUNCTIONS / HANDLERS

  function handleSelectAll() {
    inputRef.current.select();
  }

  function handleClear() {
    setSearchKey("");
    setButtonState(true);
    inputRef.current.value = "";
    inputRef.current.focus();
  }

  function handleInput(e) {
    setSearchKey(e.target.value);
  }

  function handleButtons(e) {
    if (e.target.value.length > 0) setButtonState(false);
    else {
      setButtonState(true);
    }
  }

  HandleTokenExtraction();

  useEffect(() => {
    setInterval(HandleTokenExpiration, 1000);
  });

  // API CONFIG / ENDPOINTS

  axios.defaults.baseURL = "https://api.spotify.com/v1/";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  useEffect(() => {
    if (searchKey === "") {
      setNoResultsMsg("");
      setTracks([]);
      setAlbumsData([]);
      setSongsData([]);
      setArtistsData([]);
    }

    const msghelp = (
      <a href="mailto:steech@centrum.sk?subject=SWAR%20API%20issue&body=Error%20number%3A%20%3F%3F%3F%20-%20replace%20those%20question%20marks%20with%20the%20actual%20error%20number%20you%E2%80%99re%20getting">
        Please, help me.
      </a>
    );

    const APIs = async () => {
      const { data } = await axios
        .get(`search`, {
          params: {
            q: searchKey,
            type: "track",
            limit: 1,
          },
        })
        .catch((error) => {
          if (error.response) {
            setErrorApiStatus(error.response.status);
            setErrorApiHelp(msghelp);
          }
        });
      if (data.tracks.items.length <= 0) {
        setNoResultsMsg("No results");
        return;
      }

      const { data: featuresData } = await axios
        .get(`audio-features`, {
          params: {
            ids: data.tracks.items.map((track) => track.id).join(","),
          },
        })
        .catch((error) => {
          setErrorApiStatus(error.response.status);
          setErrorApiHelp(msghelp);
        });
      for (let i = 0; i < data.tracks.items.length; i += 1) {
        Object.assign(data.tracks.items[i], featuresData.audio_features[i]);
      }
      setTracks(data.tracks.items);

      const song_id = data.tracks.items[0].id;

      const { data: songsData } = await axios
        .get(`tracks/${song_id}`, {})
        .catch((error) => {
          setErrorApiStatus(error.response.status);
          setErrorApiHelp(msghelp);
        });
      setSongsData(songsData);

      const album_id = songsData.album.id;

      const { data: albumsData } = await axios
        .get(`albums/${album_id}`, {})
        .catch((error) => {
          setErrorApiStatus(error.response.status);
          setErrorApiHelp(msghelp);
        });
      setAlbumsData(albumsData);

      const { data: artistsData } = await axios
        .get(`/artists`, {
          params: {
            ids: songsData.artists.map((artistID) => artistID.id).join(","),
          },
        })
        .catch((error) => {
          setErrorApiStatus(error.response.status);
          setErrorApiHelp(msghelp);
        });
      setArtistsData(artistsData);
    };
    if (token && searchKey) APIs();
  }, [searchKey, token]);

  // RENDER DATA SECTION

  const artistImage = artistsData.artists?.length ? (
    artistsData.artists[0].images[0].url
  ) : (
    <img
      className="no-image-artist"
      title="No photograph available"
      alt="No photograph available"
    />
  );

  const followers = artistsData.artists?.length
    ? artistsData.artists[0].followers.total.toLocaleString()
    : null;

  const popularity = artistsData.artists?.length
    ? artistsData.artists[0].popularity
    : null;

  const genres = artistsData.artists?.length
    ? artistsData.artists[0].genres.join(", ")
    : null;

  const featuredArtistsImagesArray = artistsData.artists?.length ? (
    artistsData.artists
      .map((artistsImages) => artistsImages?.images[0]?.url)
      .slice(1)
  ) : (
    <img
      className="no-image-features"
      title="No photograph available"
      alt="No photograph available"
    />
  );

  const featuredArtistsFollowersArray = artistsData.artists?.length
    ? artistsData.artists
        .map((artistsFollowers, index) =>
          artistsFollowers.followers.total.toLocaleString()
        )
        .slice(1)
    : null;

  const featuredArtistsPopularityArray = artistsData.artists?.length
    ? artistsData.artists
        .map((artistsPopularity) => artistsPopularity.popularity)
        .slice(1)
    : null;

  const featuredArtistsGenresArray = artistsData.artists?.length
    ? artistsData.artists.map((artistsGenres) => artistsGenres.genres).slice(1)
    : null;

  const renderData = () => {
    return tracks.map((track) => (
      <div key={track.id}>
        {track.album.images.length ? (
          <img
            src={track.album.images[0].url}
            className="track-image"
            title="Track's cover art"
            alt="Track's cover art"
          />
        ) : (
          <img
            className="no-image-track"
            title="No cover art for a track"
            alt="No cover art for a track"
          />
        )}
        <div className="track-info">
          <div>
            <span>track </span>
            <b>{track.name}</b>
          </div>
          <div>
            <span>artist </span>
            <b>{track.artists[0].name}</b>
          </div>
          <div>
            <span># of featured artists </span>
            <b>{track.artists.length - 1}</b>
          </div>
          {track.artists
            .map((artist, index) => (
              <div key={artist.name}>
                <span>feature #{index} </span>
                <b>{artist.name}</b>
              </div>
            ))
            .slice(1)}
          <div>
            <span>track's popularity </span>
            <b>{songsData.popularity} / 100 </b>
          </div>
          <div>
            <span>explicit </span>
            <b>{songsData.explicit ? "Yes" : "No"} </b>
          </div>
          <div>
            <span>released on </span>
            <b>
              {moment(albumsData.release_date).format("dddd, MMMM Do YYYY")}
            </b>
          </div>
          <div>
            <span>from </span>
            <b>
              {albumsData.name} ({albumsData.album_type})
            </b>
          </div>
          <div>
            <span>track's # on album / single / EP </span>
            <b>
              {songsData.track_number} / {albumsData.total_tracks}
            </b>
          </div>
          <div>
            <span>released under </span>
            <b>{albumsData.label}</b>
          </div>
          <div>
            <br />

            <span>tempo </span>
            <b>{Math.round(track.tempo)} BPM </b>
          </div>
          <div>
            <span>key </span>
            <b>
              {Key(track.key)} {Mode(track.mode)}
            </b>
          </div>
          <div>
            <span>duration </span>
            <b>{MsToMinAndSec(track.duration_ms)} </b>
          </div>
          <div>
            <span>time signature </span>
            <b>{track.time_signature} / 4 </b>
          </div>
          <div>
            <span>loudness </span>
            <b>{Math.round(track.loudness)} dB</b>
          </div>

          <br />

          <div>
            <span>accousticness </span>
            <b>{Math.round(track.acousticness * 100)} / 100</b>
          </div>
          <div>
            <span>danceability </span>
            <b>{Math.round(track.danceability * 100)} / 100</b>
          </div>
          <div>
            <span>energy </span>
            <b>{Math.round(track.energy * 100)} / 100</b>
          </div>
          <div>
            <span>happiness </span>
            <b>{Math.round(track.valence * 100)} / 100</b>
          </div>
          <div>
            <span>instrumentalness </span>
            <b>{Math.round(track.instrumentalness * 100)} / 100</b>
          </div>
          <div>
            <span>liveness </span>
            <b>{Math.round(track.liveness * 100)} / 100</b>
          </div>
          <div>
            <span>speechiness </span>
            <b>{Math.round(track.speechiness * 100)} / 100</b>
          </div>
        </div>

        <br />

        <div className="artists-info">
          <img
            src={artistImage}
            className="artist-image"
            title="Artist's photograph"
            alt="Artist's photograph"
          />
          <div>
            <span>artist </span>
            <b>{track.artists[0].name}</b>
          </div>
          <div>
            <span>followers </span>
            <b>{followers}</b>
          </div>
          <div>
            <span>popularity </span>
            <b>{popularity} / 100</b>
          </div>
          <div>
            <span>genres </span>
            {!genres ? (
              <b>none available</b>
            ) : genres.length ? (
              <b>{genres}</b>
            ) : (
              <></>
            )}
          </div>

          <br />

          {track.artists
            .map((artistsName, index) => (
              <div key={artistsName.name}>
                <div>
                  {featuredArtistsImagesArray?.[index - 1] === undefined ? (
                    <img
                      className="no-image-features"
                      title="No photograph available"
                      alt=""
                    />
                  ) : (
                    <img
                      src={featuredArtistsImagesArray?.[index - 1]}
                      className="artist-image-features"
                      title="Featured artist's photograph"
                      alt="Featured artist's photograph"
                    />
                  )}
                </div>
                <span>feature #{index} </span>
                <b>{artistsName.name}</b>
                <div>
                  <span>followers </span>
                  <b>{featuredArtistsFollowersArray?.[index - 1]}</b>
                </div>
                <div>
                  <span>popularity </span>
                  <b> {featuredArtistsPopularityArray?.[index - 1]} / 100</b>
                </div>
                <div>
                  <span>genres </span>
                  {featuredArtistsGenresArray?.[index - 1] <= 0 ? (
                    <b>none available</b>
                  ) : featuredArtistsGenresArray?.length ? (
                    <b>{featuredArtistsGenresArray?.[index - 1]?.join(", ")}</b>
                  ) : (
                    <></>
                  )}
                </div>

                <br />
              </div>
            ))
            .slice(1)}
        </div>
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>
          <font>S</font>potify <font>W</font>eb <font>A</font>PI +{" "}
          <font className="react-font">R</font>eact
        </h2>
      </header>
      {!token ? (
        <div className="main-page">
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=${RESPONSE_TYPE}`}
          >
            <button>Login with Spotify</button>
          </a>
          <h4>
            <br />
            Search for some additional information which is not available in
            Spotify app - web / desktop / mobile.
          </h4>
          <section>
            Track - popularity, tempo, key, time signature, loudness,
            accousticness, danceability, energy, happiness, instrumentalnes,
            liveness & speechiness
          </section>
          <br />
          <section>Artist - popularity & genres</section>
          <br />
        </div>
      ) : (
        <div>
          <div className="buttons">
            <button onClick={LogOut}>Log out</button>
            <button
              disabled={buttonState}
              type="button"
              className="select-all-button"
              onClick={handleSelectAll}
            >
              Select all
            </button>
            <button
              disabled={buttonState}
              type="button"
              className="clear-button"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
          <DebounceInput
            onInput={handleButtons}
            type="text"
            inputRef={inputRef}
            onChange={handleInput}
            debounceTimeout={300}
            placeholder="Search for a track"
            onKeyDown={HandleWhitespace}
            value={searchKey}
            autoFocus
          />
          <p>{errorApiStatus}</p>
          <p>{errorApiHelp}</p>
        </div>
      )}

      {tracks.length <= 0 &&
      token &&
      !noResultsMsg &&
      !errorApiStatus &&
      !errorApiHelp ? (
        <span className="search-info">
          After you stop typing, results will be shown in a second
        </span>
      ) : (
        <></>
      )}

      {tracks.length > 0 ? renderData() : <p>{noResultsMsg}</p>}
    </div>
  );
}

export default App;
