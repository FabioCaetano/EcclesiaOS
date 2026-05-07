import React, { useEffect, useMemo, useState } from "react";
import { Music, Plus, Trash2 } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { ChurchEvent, CurrentUser, Song, SongInput, WorshipSet, WorshipSetInput } from "@ecclesiaos/shared";
import { deleteSong, deleteWorshipSet, loadEvents, loadSongs, loadWorshipSets, saveSong, saveWorshipSet } from "./api";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const emptySong: SongInput = {
  title: "",
  artist: "",
  defaultKey: "",
  bpm: 0,
  theme: "",
  lyrics: "",
  chords: "",
  notes: ""
};

const emptySet: WorshipSetInput = {
  eventId: "",
  title: "",
  date: "",
  notes: "",
  items: []
};

const eventLabel = (event: ChurchEvent) => `${event.date} ${event.startTime} - ${event.title}`;

export const MusicPage: React.FC<Props> = ({ token, user }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [sets, setSets] = useState<WorshipSet[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [songForm, setSongForm] = useState<SongInput>(emptySong);
  const [setForm, setSetForm] = useState<WorshipSetInput>(emptySet);
  const [status, setStatus] = useState("");

  const canManage = canManageModule(user.role, "music");

  const refresh = async () => {
    const [songData, setData, eventData] = await Promise.all([loadSongs(token), loadWorshipSets(token), loadEvents(token)]);
    setSongs(songData);
    setSets(setData);
    setEvents(eventData);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar musicas e repertorios."));
  }, [token]);

  const selectedSong = songs.find((song) => song.id === selectedSongId) || null;
  const selectedSet = sets.find((set) => set.id === selectedSetId) || null;

  const songsById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);
  const upcomingEvents = useMemo(() => [...events].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).slice(0, 40), [events]);

  const selectSong = (song: Song) => {
    setSelectedSongId(song.id);
    setSongForm({
      title: song.title,
      artist: song.artist,
      defaultKey: song.defaultKey,
      bpm: song.bpm,
      theme: song.theme,
      lyrics: song.lyrics,
      chords: song.chords,
      notes: song.notes
    });
    setStatus("");
  };

  const startNewSong = () => {
    setSelectedSongId(null);
    setSongForm(emptySong);
    setStatus("");
  };

  const selectSet = (set: WorshipSet) => {
    setSelectedSetId(set.id);
    setSetForm({
      eventId: set.eventId,
      title: set.title,
      date: set.date,
      notes: set.notes,
      items: set.items
    });
    setStatus("");
  };

  const startNewSet = () => {
    setSelectedSetId(null);
    setSetForm(emptySet);
    setStatus("");
  };

  const handleEventChange = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    setSetForm((current) => ({
      ...current,
      eventId,
      title: event ? `Repertorio - ${event.title}` : current.title,
      date: event?.date || current.date
    }));
  };

  const addSongToSet = (songId: string) => {
    const song = songsById.get(songId);
    if (!song) return;
    setSetForm((current) => ({
      ...current,
      items: [...current.items, { songId, key: song.defaultKey, notes: "", order: current.items.length + 1 }]
    }));
  };

  const removeSetItem = (index: number) => {
    setSetForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }))
    }));
  };

  const handleSongSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setStatus("Salvando musica...");
    try {
      const saved = await saveSong(token, songForm, selectedSongId || undefined);
      await refresh();
      selectSong(saved);
      setStatus("Musica salva.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar a musica.");
    }
  };

  const handleSetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setStatus("Salvando repertorio...");
    try {
      const saved = await saveWorshipSet(token, setForm, selectedSetId || undefined);
      await refresh();
      selectSet(saved);
      setStatus("Repertorio salvo.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o repertorio.");
    }
  };

  const handleDeleteSong = async () => {
    if (!canManage || !selectedSongId || !window.confirm("Remover esta musica da biblioteca?")) return;
    await deleteSong(token, selectedSongId);
    await refresh();
    startNewSong();
    setStatus("Musica removida.");
  };

  const handleDeleteSet = async () => {
    if (!canManage || !selectedSetId || !window.confirm("Remover este repertorio?")) return;
    await deleteWorshipSet(token, selectedSetId);
    await refresh();
    startNewSet();
    setStatus("Repertorio removido.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={Music}
        title="Musicas e repertorio"
        description="Biblioteca de musicas, tons e playlists vinculadas aos cultos."
        actions={canManage && (
          <>
            <button className="secondary-button" type="button" onClick={startNewSong}><Plus size={16} /> Musica</button>
            <button className="secondary-button" type="button" onClick={startNewSet}><Plus size={16} /> Repertorio</button>
          </>
        )}
      />

      {status && <p className="form-status">{status}</p>}

      <div className="report-grid">
        <article><span>Musicas</span><strong>{songs.length}</strong></article>
        <article><span>Repertorios</span><strong>{sets.length}</strong></article>
        <article><span>Eventos disponiveis</span><strong>{events.length}</strong></article>
        <article><span>Permissao</span><strong>{canManage ? "Edicao" : "Leitura"}</strong></article>
      </div>

      <div className="people-layout">
        <Card className="people-list" aria-label="Biblioteca de musicas">
          <h3>Biblioteca</h3>
          {songs.length === 0 ? <p className="muted">Nenhuma musica cadastrada.</p> : songs.map((song) => (
            <button className={selectedSongId === song.id ? "person-row selected" : "person-row"} key={song.id} type="button" onClick={() => selectSong(song)}>
              <strong>{song.title}</strong>
              <span>{song.artist || "Sem artista"} - Tom {song.defaultKey || "n/i"}{song.bpm ? ` - ${song.bpm} bpm` : ""}</span>
            </button>
          ))}
        </Card>

        <form className="person-form" onSubmit={handleSongSubmit}>
          <label>Titulo<input disabled={!canManage} value={songForm.title} onChange={(event) => setSongForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Artista<input disabled={!canManage} value={songForm.artist} onChange={(event) => setSongForm((current) => ({ ...current, artist: event.target.value }))} /></label>
          <label>Tom principal<input disabled={!canManage} value={songForm.defaultKey} onChange={(event) => setSongForm((current) => ({ ...current, defaultKey: event.target.value }))} /></label>
          <label>BPM<input disabled={!canManage} min="0" type="number" value={songForm.bpm} onChange={(event) => setSongForm((current) => ({ ...current, bpm: Number(event.target.value) }))} /></label>
          <label className="wide-field">Tema<input disabled={!canManage} value={songForm.theme} onChange={(event) => setSongForm((current) => ({ ...current, theme: event.target.value }))} /></label>
          <label className="wide-field">Cifra<textarea disabled={!canManage} value={songForm.chords} onChange={(event) => setSongForm((current) => ({ ...current, chords: event.target.value }))} /></label>
          <label className="wide-field">Letra<textarea disabled={!canManage} value={songForm.lyrics} onChange={(event) => setSongForm((current) => ({ ...current, lyrics: event.target.value }))} /></label>
          <label className="wide-field">Notas<textarea disabled={!canManage} value={songForm.notes} onChange={(event) => setSongForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">{selectedSong ? "Salvar musica" : "Criar musica"}</button>}
            {canManage && selectedSong && <button className="danger-button" type="button" onClick={handleDeleteSong}><Trash2 size={16} /> Remover</button>}
          </div>
        </form>
      </div>

      <div className="people-layout">
        <Card className="people-list" aria-label="Lista de repertorios">
          <h3>Repertorios</h3>
          {sets.length === 0 ? <p className="muted">Nenhum repertorio cadastrado.</p> : sets.map((set) => (
            <button className={selectedSetId === set.id ? "person-row selected" : "person-row"} key={set.id} type="button" onClick={() => selectSet(set)}>
              <strong>{set.title}</strong>
              <span>{set.date || "Sem data"} - {set.items.length} musica{set.items.length === 1 ? "" : "s"}</span>
            </button>
          ))}
        </Card>

        <form className="person-form" onSubmit={handleSetSubmit}>
          <label className="wide-field">
            Culto/evento
            <select disabled={!canManage} value={setForm.eventId} onChange={(event) => handleEventChange(event.target.value)}>
              <option value="">Sem evento vinculado</option>
              {upcomingEvents.map((event) => <option key={event.id} value={event.id}>{eventLabel(event)}</option>)}
            </select>
          </label>
          <label>Titulo<input disabled={!canManage} value={setForm.title} onChange={(event) => setSetForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Data<input disabled={!canManage} type="date" value={setForm.date} onChange={(event) => setSetForm((current) => ({ ...current, date: event.target.value }))} /></label>
          <label className="wide-field">
            Adicionar musica
            <select disabled={!canManage || songs.length === 0} value="" onChange={(event) => addSongToSet(event.target.value)}>
              <option value="">Selecione uma musica</option>
              {songs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
            </select>
          </label>
          <div className="wide-field">
            <h3>Playlist</h3>
            {setForm.items.length === 0 ? <p className="muted">Adicione musicas ao repertorio.</p> : setForm.items.map((item, index) => {
              const song = songsById.get(item.songId);
              return (
                <div className="report-row" key={`${item.songId}-${index}`}>
                  <span>{index + 1}. {song?.title || "Musica removida"} - Tom {item.key || song?.defaultKey || "n/i"}</span>
                  {canManage && <button className="icon-button danger-button" type="button" onClick={() => removeSetItem(index)} aria-label="Remover musica"><Trash2 size={16} /></button>}
                </div>
              );
            })}
          </div>
          <label className="wide-field">Notas do repertorio<textarea disabled={!canManage} value={setForm.notes} onChange={(event) => setSetForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">{selectedSet ? "Salvar repertorio" : "Criar repertorio"}</button>}
            {canManage && selectedSet && <button className="danger-button" type="button" onClick={handleDeleteSet}><Trash2 size={16} /> Remover</button>}
          </div>
        </form>
      </div>

    </>
  );
};
