import React, { useEffect, useMemo, useState } from "react";
import type { ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, CurrentUser, EventCheckIn } from "@ecclesiaos/shared";
import { loadChildCheckIns, loadChurchProfile, loadEventCheckIns, loadEvents, loadResources } from "./api";
import { roleLabels } from "./constants";

interface Props {
  token: string;
  user: CurrentUser;
}

const channelIdFromUrl = (url: string) => {
  const match = url.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/);
  return match?.[1] || "";
};

const uploadsPlaylistFromChannel = (url: string) => {
  const channelId = channelIdFromUrl(url);
  return channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : "";
};

export const HomePage: React.FC<Props> = ({ token, user }) => {
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [eventCheckIns, setEventCheckIns] = useState<EventCheckIn[]>([]);
  const [childCheckIns, setChildCheckIns] = useState<ChildCheckIn[]>([]);
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

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = useMemo(() => events.filter((event) => event.date >= today).slice(0, 5), [events, today]);
  const openChildren = childCheckIns.filter((item) => !item.checkedOutAt);
  const activeResources = resources.filter((resource) => resource.isActive);
  const youtubePlaylist = uploadsPlaylistFromChannel(church?.youtubeChannelUrl || "");

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
              <h2>Ultimas transmissoes</h2>
            </div>
          </div>
          {!church?.youtubeChannelUrl ? (
            <p className="muted">Defina o canal do YouTube no cadastro da igreja para exibir as transmissoes aqui.</p>
          ) : youtubePlaylist ? (
            <div className="youtube-grid">
              {[0, 1, 2].map((index) => (
                <iframe
                  key={index}
                  title={`Video recente ${index + 1}`}
                  src={`https://www.youtube-nocookie.com/embed/videoseries?list=${youtubePlaylist}&index=${index}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ))}
            </div>
          ) : (
            <div className="youtube-fallback">
              <p className="muted">O canal esta configurado, mas ainda nao foi possivel derivar automaticamente a playlist de videos.</p>
              <a href={church.youtubeChannelUrl} target="_blank" rel="noreferrer">Abrir canal</a>
            </div>
          )}
        </div>
      </section>

      {status && <p className="muted">{status}</p>}
    </>
  );
};
