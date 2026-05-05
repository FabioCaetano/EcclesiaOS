import React, { useEffect, useMemo, useState } from "react";
import { Baby, CalendarDays, ExternalLink, Home, Sparkles, PlayCircle } from "lucide-react";
import type { ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, CurrentUser, EventCheckIn, YouTubeFeed, YouTubeFeedError } from "@ecclesiaos/shared";
import { loadChildCheckIns, loadChurchProfile, loadEventCheckIns, loadEvents, loadResources, loadYouTubeVideos } from "./api";
import { Card, EmptyState, PageHeader } from "./ui";

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
  const [youtube, setPlayCircle] = useState<YouTubeFeed | YouTubeFeedError | null>(null);
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
      .then(setPlayCircle)
      .catch(() => setPlayCircle({ error: "feed_unavailable", message: "Nao foi possivel carregar os videos do YouTube." }));
  }, [token]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = useMemo(() => events.filter((event) => event.date >= today).slice(0, 5), [events, today]);
  const openChildren = childCheckIns.filter((item) => !item.checkedOutAt);
  const activeResources = resources.filter((resource) => resource.isActive);
  const youtubeFeed = youtube && !isFeedError(youtube) ? youtube : null;
  const youtubeError = youtube && isFeedError(youtube) ? youtube : null;
  const youtubeVideos = youtubeFeed?.videos.slice(0, 6) ?? [];

  const description = church?.name
    ? `Visao operacional de ${church.name}. Acompanhe agenda, check-in e ambientes em tempo real.`
    : "Visao operacional da igreja. Acompanhe agenda, check-in e ambientes em tempo real.";

  return (
    <>
      <PageHeader
        eyebrow="Painel inicial"
        icon={Home}
        title={`Ola, ${user.name.split(" ")[0]}`}
        description={description}
      />

      {status && <p className="muted">{status}</p>}

      <div className="home-kpis">
        <article>
          <span><CalendarDays size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Proximos eventos</span>
          <strong>{upcomingEvents.length}</strong>
        </article>
        <article>
          <span>Check-ins hoje</span>
          <strong>{eventCheckIns.length}</strong>
        </article>
        <article>
          <span><Baby size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Criancas ativas</span>
          <strong>{openChildren.length}</strong>
        </article>
        <article>
          <span><Sparkles size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Ambientes ativos</span>
          <strong>{activeResources.length}</strong>
        </article>
      </div>

      <div className="home-grid">
        <Card>
          <div className="section-heading">
            <div>
              <p className="eyebrow"><CalendarDays size={12} />Agenda</p>
              <h2>Proximos compromissos</h2>
            </div>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nenhum evento futuro"
              description="Cadastre eventos na Agenda para que eles aparecam aqui."
            />
          ) : (
            upcomingEvents.map((event) => (
              <p className="report-row" key={event.id}>
                <span>{event.date} {event.startTime} - {event.title}</span>
                <strong>{event.location || "Sem local"}</strong>
              </p>
            ))
          )}
        </Card>

        <Card>
          <div className="section-heading">
            <div>
              <p className="eyebrow"><PlayCircle size={12} />YouTube</p>
              <h2>Ultimos videos</h2>
            </div>
            {youtubeFeed?.channelTitle && <span className="muted">{youtubeFeed.channelTitle}</span>}
          </div>
          {!church?.youtubeChannelUrl ? (
            <EmptyState
              icon={PlayCircle}
              title="Canal nao configurado"
              description="Adicione a URL do canal no cadastro da igreja para ver os videos aqui."
            />
          ) : !youtube ? (
            <p className="muted">Carregando videos do canal...</p>
          ) : youtubeError ? (
            <div className="youtube-fallback">
              <p className="muted">{youtubeError.message}</p>
              <a className="secondary-link" href={church.youtubeChannelUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Abrir canal
              </a>
            </div>
          ) : youtubeVideos.length === 0 ? (
            <EmptyState
              icon={PlayCircle}
              title="Sem videos no momento"
              description="O canal nao retornou videos recentes."
            />
          ) : (
            <div className="youtube-grid">
              {youtubeVideos.map((video) => (
                <a key={video.id} className="youtube-card" href={video.url} target="_blank" rel="noreferrer">
                  {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />}
                  <div className="youtube-card-body">
                    <strong>{video.title}</strong>
                    {video.publishedAt && <span>{formatPublishedAt(video.publishedAt)}</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
