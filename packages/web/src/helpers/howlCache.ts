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

import { type HowlOptions as BaseHowlOptions, Howl } from "howler";

export type HowlOptions = BaseHowlOptions & {
  src: string; // override src property to only be a single string
};

/**
 * A cache that tracks all the instances of AudioSources created by the library
 * An instance is cached based on the src attribute it was created with
 *
 * This prevents duplicate instances of audio being created in certain edge cases
 * React StrictMode being one such scenario
 */
class HowlCache {
  private _cache: Map<string, Howl> = new Map();

  public create(options: HowlOptions): Howl {
    const key = options.src;
    if (this._cache.has(key)) {
      return this._cache.get(key)!;
    }

    const howl = new Howl(options);
    this._cache.set(key, howl);
    return howl;
  }

  public set(key: string, howl: Howl) {
    this._cache.set(key, howl);
  }

  public get(key: string) {
    return this._cache.get(key);
  }

  public clear(key: string) {
    this._cache.delete(key);
  }

  public destroy(key: string) {
    const howl = this.get(key);
    if (howl) {
      howl.unload();
      this.clear(key);
    }
  }

  public reset() {
    this._cache.values().forEach((audio) => {
      audio.unload();
    });
    this._cache.clear();
  }
}

const howlCache = new HowlCache();

export default howlCache;
