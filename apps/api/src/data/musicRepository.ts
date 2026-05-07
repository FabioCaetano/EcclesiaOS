import type { Song, SongInput, WorshipSet, WorshipSetInput, WorshipSetItem } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createSongId = () => `song_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createSetId = () => `wset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeSongInput = (input: SongInput): SongInput => ({
  title: String(input.title || "").trim(),
  artist: String(input.artist || "").trim(),
  defaultKey: String(input.defaultKey || "").trim(),
  bpm: Math.max(0, Math.round(Number(input.bpm) || 0)),
  theme: String(input.theme || "").trim(),
  lyrics: String(input.lyrics || "").trim(),
  chords: String(input.chords || "").trim(),
  notes: String(input.notes || "").trim()
});

const normalizeItems = (items: WorshipSetItem[], validSongIds: Set<string>): WorshipSetItem[] => (
  (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      songId: String(item.songId || "").trim(),
      key: String(item.key || "").trim(),
      notes: String(item.notes || "").trim(),
      order: Math.max(1, Number(item.order) || index + 1)
    }))
    .filter((item) => item.songId && validSongIds.has(item.songId))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }))
);

const normalizeSetInput = (input: WorshipSetInput, validSongIds: Set<string>): WorshipSetInput => ({
  eventId: String(input.eventId || "").trim(),
  title: String(input.title || "").trim(),
  date: String(input.date || "").trim(),
  notes: String(input.notes || "").trim(),
  items: normalizeItems(input.items, validSongIds)
});

export const musicRepository = {
  async listSongs(): Promise<Song[]> {
    const data = await readData();
    return [...data.songs].sort((a, b) => a.title.localeCompare(b.title));
  },

  async createSong(input: SongInput): Promise<Song> {
    const data = await readData();
    const now = new Date().toISOString();
    const song: Song = {
      id: createSongId(),
      ...normalizeSongInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, songs: [...data.songs, song] });
    return song;
  },

  async updateSong(id: string, input: SongInput): Promise<Song | null> {
    const data = await readData();
    const existing = data.songs.find((song) => song.id === id);
    if (!existing) return null;

    const updated: Song = {
      ...existing,
      ...normalizeSongInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, songs: data.songs.map((song) => song.id === id ? updated : song) });
    return updated;
  },

  async removeSong(id: string): Promise<boolean> {
    const data = await readData();
    const nextSongs = data.songs.filter((song) => song.id !== id);
    if (nextSongs.length === data.songs.length) return false;

    const nextSets = data.worshipSets.map((set) => ({
      ...set,
      items: set.items.filter((item) => item.songId !== id).map((item, index) => ({ ...item, order: index + 1 }))
    }));
    await writeData({ ...data, songs: nextSongs, worshipSets: nextSets });
    return true;
  },

  async listSets(): Promise<WorshipSet[]> {
    const data = await readData();
    return [...data.worshipSets].sort((a, b) => `${a.date} ${a.title}`.localeCompare(`${b.date} ${b.title}`));
  },

  async createSet(input: WorshipSetInput): Promise<WorshipSet> {
    const data = await readData();
    const now = new Date().toISOString();
    const songIds = new Set(data.songs.map((song) => song.id));
    const set: WorshipSet = {
      id: createSetId(),
      ...normalizeSetInput(input, songIds),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, worshipSets: [...data.worshipSets, set] });
    return set;
  },

  async updateSet(id: string, input: WorshipSetInput): Promise<WorshipSet | null> {
    const data = await readData();
    const existing = data.worshipSets.find((set) => set.id === id);
    if (!existing) return null;

    const songIds = new Set(data.songs.map((song) => song.id));
    const updated: WorshipSet = {
      ...existing,
      ...normalizeSetInput(input, songIds),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, worshipSets: data.worshipSets.map((set) => set.id === id ? updated : set) });
    return updated;
  },

  async removeSet(id: string): Promise<boolean> {
    const data = await readData();
    const nextSets = data.worshipSets.filter((set) => set.id !== id);
    if (nextSets.length === data.worshipSets.length) return false;

    await writeData({ ...data, worshipSets: nextSets });
    return true;
  }
};
