import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { baseSongs } from "./baseStates";
import { Provider, connect } from "react-redux";
import { store } from "./reduxStuff";

import searchStyles from "./search.module.css";
import playerStyles from "./player.module.css";
import songStyles from "./song.module.css";

function Song({ song }) {
  const { title, id, thumbnail, duration } = song;

  const playClickHandler = (e) => {
    e.preventDefault();
    let audio = document.querySelector("audio");
    audio.src = "http://127.0.0.1:8080/audio?id=" + id;
  }

  return (
    <div className={songStyles.songDiv}>
      {/* <div className={songStyles.thumbnailImgDiv}>
        <img className={songStyles.thumbnailImg} src={thumbnail} alt={title} />
      </div> */}
      <a className={songStyles.play} onClick={playClickHandler} href="#"><i className="fas fa-play"></i></a>
      <span className={songStyles.songTitle}>{title}</span>
    </div>
  );
}

// const Song = connect(null, (dispatch) => ({ togglePlayPause: () => { dispatch({ type: "PlayPause" }) } }))(SongRaw);

function Search() {
  let [songs, updateSongs] = useState(JSON.parse(baseSongs));

  const submitQuery = async (e) => {
    if (e.keyCode === 13) {
      updateSongs(await (await fetch("http://127.0.0.1:8080/?search=" + e.target.value)).json());
    }
  }

  return (
    <div className={searchStyles.searchDiv}>
      <input className={searchStyles.searchBar} onKeyDown={submitQuery} type="text" placeholder="Search Query" />
      {songs.map((song) => <Song key={song.id} song={song} />)}
    </div>
  );
}

function Player() {

  let [playing, updatePlaying] = useState(false);
  let [timeSeconds, updateTimeSeconds] = useState(0);

  // (async () => {
  //   let audioContext = new AudioContext();
  //   let mediaStreamSource = audioContext.createMediaStreamSource(new MediaStream((await fetch("http://127.0.0.1:8080/audio")).body));
  //   let audio = new Audio();
  //   audio.autoplay = true;
  //   audio.srcObject = mediaStreamSource;
  // })();

  const playPauseClickHandler = (e) => {
    e.preventDefault();
    let audio = document.querySelector("audio");
    if (audio.paused) audio.play();
    else audio.pause();
  }

  const playHandler = (e) => {
    updatePlaying(true);
  }

  const pauseHandler = () => {
    updatePlaying(false);
  }

  const progressHandler = (e) => {
    document.querySelector("#seekSlider").value = e.target.currentTime;
  }

  const canPlayHandler = (e) => {
    document.querySelector("#seekSlider").max = Math.floor(e.target.duration);
  }

  const onErr = (e) => {
    console.log(e.target.error);
  }

  return (
    <div className={playerStyles.playerDiv}>
      <audio src="http://127.0.0.1:8080/audio2" controls onError={onErr} onCanPlay={canPlayHandler} onProgress={progressHandler} onPause={pauseHandler} onPlay={playHandler} autoPlay />
      {/* <source src="http://127.0.0.1:8080/audio?id=By_Cn5ixYLg" />
      </audio> */}
      <a className={playerStyles.playPause} onClick={playPauseClickHandler} href="#">
        {playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
      </a>
      {/* <div className={playerStyles.seekBar}><div className={playerStyles.seekButton}></div></div> */}
      <input id="seekSlider" className={playerStyles.slider} type="range" min="0" max="100" value="0" />
    </div>
  );
}

// const Player = connect((state) => ({ playing: state.playing }), (dispatch) => ({ togglePlayPause: () => { dispatch({ type: "PlayPause" }) } }))(PlayerRaw);

function App() {

  return (
    <div className="appDiv">
      <Search />
      <Player />
    </div>
  );
}

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));

serviceWorker.unregister();
