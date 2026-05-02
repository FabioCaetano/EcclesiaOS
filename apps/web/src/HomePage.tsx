import React, { useEffect, useMemo, useState } from "react";
import type { ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, CurrentUser, EventCheckIn, YouTubeFeed, YouTubeFeedError } from "@ecclesiaos/shared";
import { loadChildCheckIns, loadChurchProfile, loadEventCheckIns, loadEvents, loadResources, loadYouTubeVideos } from "./api";
import { roleLabels } from "./constants";

interface Props {
  token: string;
  user: CurrentUser;
}

const isFeedError = (value: YouTubeFeed | YouTubeFeedError | null): value is YouTubeFeedError => Boolean(value && "error" in value);

const formatPublishedAt = (iso: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

export const HomePage: React.FC<Props> = ({ token, user }) => {
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [eventCheckIns, setEventCheckIns] = useState<EventCheckIn[]>([]);
  const [childCheckIns, setChildCheckIns] = useState<ChildCheckIn[]>([]);
  const [youtube, setYoutube] = useState<YouTubeFeed | YouTubeFeedError | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([
      loadChurchProfile(token),
      loadEvents(token),
      loadResources(token),
      loadEventCheckIns(token),
      loadChildCheckIns(token)
    ])
      .then(([nextChurch, nextEvents, nextResources, nextEventCheckIns, nextChildCheckIns]) => {
        setChurch(nextChurch);
        setEvents(nextEvents);
        setResources(nextResources);
        setEventCheckIns(nextEventCheckIns);
        setChildCheckIns(nextChildCheckIns);
      })
      .catch(() => setStatus("Nao foi possivel carregar o painel inicial."));
  }, [token]);

  useEffect(() => {
    loadYouTubeVideos(token)
      .then(setYoutube)
      .catch(() => setYoutube({ error: "feed_unavailable", message: "Nao foi possivel carregar os videos do YouTube." }));
  }, [token]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = useMemo(() => events.filter((event) => event.date >= today).slice(0, 5), [events, today]);
  const openChildren = childCheckIns.filter((item) => !item.checkedOutAt);
  const activeResources = resources.filter((resource) => resource.isActive);
  const youtubeFeed = youtube && !isFeedError(youtube) ? youtube : null;
  const youtubeError = youtube && isFeedError(youtube) ? youtube : null;
  const youtubeVideos = youtubeFeed?.videos.slice(0, 6) ?? [];

  return (
    <>
      <section className="home-hero">
        <div>
          <p className="eyebrow">Painel inicial</p>
          <h1>{church?.name || "EcclesiaOS"}</h1>
          <p className="lead">Visao rapida da operacao da igreja: agenda, check-in, ambientes e transmissao.</p>
        </div>
        <div className="status-panel" aria-label="Usuario atual">
          <span className="status-dot" />
          <div>
            <strong>{user.name}</strong>
            <p>{roleLabels[user.role]} conectado como {user.email}</p>
          </div>
        </div>
      </section>

      <section className="home-kpis">
        <article><span>Proximos eventos</span><strong>{upcomingEvents.length}</strong></article>
        <article><span>Check-ins hoje</span><strong>{eventCheckIns.length}</strong></article>
        <article><span>Criancas ativas</span><strong>{openChildren.length}</strong></article>
        <article><span>Ambientes ativos</span><strong>{activeResources.length}</strong></article>
      </section>

      <section className="home-grid">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Proximos compromissos</h2>
            </div>
          </div>
          {upcomingEvents.length === 0 ? <p className="muted">Nenhum evento futuro cadastrado.</p> : upcomingEvents.map((event) => (
            <p className="report-row" key={event.id}>
              <span>{event.date} {event.startTime} - {event.title}</span>
              <strong>{event.location || "Sem local"}</strong>
            </p>
          ))}
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YouTube</p>
              <h2>Ultimos videos</h2>
            </div>
            {youtubeFeed?.channelTitle && <span className="muted">{youtubeFeed.channelTitle}</span>}
          </div>
          {!church?.youtubeChannelUrl ? (
            <p className="muted">Defina o canal do YouTube no cadastro da igreja para exibir os videos aqui.</p>
          ) : !youtube ? (
            <p className="muted">Carregando videos do canal...</p>
          ) : youtubeError ? (
            <div className="youtube-fallback">
              <p className="muted">{youtubeError.message}</p>
              <a href={church.youtubeChannelUrl} target="_blank" rel="noreferrer">Abrir canal</a>
            </div>
          ) : youtubeVideos.length === 0 ? (
            <div className="youtube-fallback">
              <p className="muted">O canal nao retornou videos no momento.</p>
              <a href={church.youtubeChannelUrl} target="_blank" rel="noreferrer">Abrir canal</a>
            </div>
          ) : (
            <div className="youtube-grid">
              {youtubeVideos.map((video) => (
                <a key={video.id} className="youtube-card" href={video.url} target="_blank" rel="noreferrer">
                  {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />}
                  <div className="youtube-card-body">
                    <strong>{video.title}</strong>
                    {video.publishedAt && <span className="muted">{formatPublishedAt(video.publishedAt)}</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {status && <p className="muted">{status}</p>}
    </>
  );
};
