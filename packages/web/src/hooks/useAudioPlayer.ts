// MIT License
//
// Copyright (c) 2020 Erich Kuerschner
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import type { Howl } from "howler";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import {
  defaultState,
  HowlStore,
  type Snapshot
} from "@/store/non-persisted/audio/HowlStore";
import type { AudioControls, AudioLoadOptions } from "@/types/howl";

export type AudioPlayer = AudioControls &
  Snapshot & {
    /** A reference to the underlying Howl object.
     * Use as an escape hatch for behavior not provided by useAudioPlayer. Please refer to Howler [documentation](https://github.com/goldfire/howler.js#documentation)
     * Manipulating the audio directly through the Howl may cause state to desynchronize
     * */
    player: Howl | null;
    src: string | null;
    /** A way to explicitly load an audio resource */
    load: (...args: [string, AudioLoadOptions | undefined]) => void;
    /** Removes event listeners, resets state and unloads the internal Howl object */
    cleanup: () => void;
  };

export function useAudioPlayer(
  src: string,
  options?: AudioLoadOptions
): Omit<AudioPlayer, "load">;
export function useAudioPlayer(): AudioPlayer;

/**
 * @param {string} src - The src path of the audio resource. Changing this will cause a new sound to immediately load
 * @param {AudioLoadOptions} options - Options for the loaded audio including initial properties and configuration. These can later be changed through the API.
 * @return {AudioPlayer} The audio player instance with methods for controlling playback and state.
 */
export function useAudioPlayer(src?: string, options?: AudioLoadOptions) {
  const audioRef = useRef(new HowlStore());

  // when the src param is used, load a new sound whenever the value changes
  if (src && audioRef.current && src !== audioRef.current.src) {
    audioRef.current.load({
      autoplay: options?.autoplay,
      format: options?.format,
      html5: options?.html5,
      loop: options?.loop,
      mute: options?.initialMute,
      preload: options?.preload,
      rate: options?.initialRate,
      src,
      volume: options?.initialVolume,
      // event callbacks
      ...options
    });
  }

  // need to bind functions back to the howl since they will be called from the context of React
  const state = useSyncExternalStore(
    audioRef.current.subscribe.bind(audioRef.current),
    audioRef.current.getSnapshot.bind(audioRef.current),
    () => defaultState
  );

  useEffect(() => {
    // load the sound on mount if the src param is being used
    // this is required for StrictMode when React may remount the hook
    if (src && audioRef.current.src === null) {
      audioRef.current.load({
        autoplay: options?.autoplay,
        format: options?.format,
        html5: options?.html5,
        loop: options?.loop,
        mute: options?.initialMute,
        preload: options?.preload,
        rate: options?.initialRate,
        src,
        volume: options?.initialVolume,
        // event callbacks
        ...options
      });
    }

    // cleans up the sound when hook unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.destroy();
      }
    };
  }, []);

  const load: AudioPlayer["load"] = useCallback((src, options) => {
    audioRef.current.load({
      autoplay: options?.autoplay,
      format: options?.format,
      html5: options?.html5,
      loop: options?.loop,
      mute: options?.initialMute,
      preload: options?.preload,
      rate: options?.initialRate,
      src,
      volume: options?.initialVolume,
      // event callbacks
      ...options
    });
  }, []);

  return {
    ...state,
    cleanup: audioRef.current.destroy.bind(audioRef.current),
    fade: audioRef.current.fade.bind(audioRef.current),
    getPosition: audioRef.current.getPosition.bind(audioRef.current),
    load: src ? undefined : load,
    loopOff: audioRef.current.loopOff.bind(audioRef.current),
    loopOn: audioRef.current.loopOn.bind(audioRef.current),
    mute: audioRef.current.mute.bind(audioRef.current),
    pause: audioRef.current.pause.bind(audioRef.current),
    // AudioControls interface
    play: audioRef.current.play.bind(audioRef.current),
    player: audioRef.current.howl,
    seek: audioRef.current.seek.bind(audioRef.current),
    setRate: audioRef.current.setRate.bind(audioRef.current),
    setVolume: audioRef.current.setVolume.bind(audioRef.current),
    src: audioRef.current.src,
    stop: audioRef.current.stop.bind(audioRef.current),
    toggleLoop: audioRef.current.toggleLoop.bind(audioRef.current),
    toggleMute: audioRef.current.toggleMute.bind(audioRef.current),
    togglePlayPause: audioRef.current.togglePlayPause.bind(audioRef.current),
    unmute: audioRef.current.unmute.bind(audioRef.current)
  };
}
