import { createStore } from "redux";

export const store = createStore((state = { playing: false }, action) => {
  switch (action.type) {
    case "PlayPause":
      return { ...state, playing: !state.playing };
    default: return state;
  }
});