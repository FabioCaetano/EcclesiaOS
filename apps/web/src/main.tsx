import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import type { AuthSession } from "@ecclesiaos/shared";
import { AccountPage } from "./AccountPage";
import { AppLayout } from "./AppLayout";
import { AttendancePage } from "./AttendancePage";
import { AuditPage } from "./AuditPage";
import { CalendarPage } from "./CalendarPage";
import { clearSession, loadChurchProfile, loadCurrentUser, loadStoredSession, saveSession } from "./api";
import { ChurchPage } from "./ChurchPage";
import { CheckInPage } from "./CheckInPage";
import { FinancePage } from "./FinancePage";
import { EventsPage } from "./EventsPage";
import { EventTotemPage } from "./EventTotemPage";
import { FormsPage } from "./FormsPage";
import { GroupsPage } from "./GroupsPage";
import { HomePage } from "./HomePage";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { LoginPage } from "./LoginPage";
import { LiturgyPage } from "./LiturgyPage";
import { KidsTotemPage } from "./KidsTotemPage";
import { MessagesPage } from "./MessagesPage";
import { MusicPage } from "./MusicPage";
import { PeoplePage } from "./PeoplePage";
import { EventRegistrationConfirmPage } from "./EventRegistrationConfirmPage";
import { PublicEventCheckInPage } from "./PublicEventCheckInPage";
import { PublicCustomFormPage } from "./PublicCustomFormPage";
import { PublicRegistrationPage } from "./PublicRegistrationPage";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { VisitorRegistrationPage } from "./VisitorRegistrationPage";
import { ResourcesPage } from "./ResourcesPage";
import { ReportsPage } from "./ReportsPage";
import { ServiceOpsPage } from "./ServiceOpsPage";
import { ServingPage } from "./ServingPage";
import { UsersPage } from "./UsersPage";
import type { AppView } from "./types";
import "./styles.css";

const App = () => {
  const publicRegistrationConfirmMatch = window.location.pathname.match(/^\/register\/[^/]+\/confirm$/);
  if (publicRegistrationConfirmMatch) {
    const params = new URLSearchParams(window.location.search);
    return <EventRegistrationConfirmPage token={params.get("token") || ""} />;
  }

  const publicRegistrationMatch = window.location.pathname.match(/^\/register\/([^/]+)$/);
  if (publicRegistrationMatch) return <PublicRegistrationPage slug={publicRegistrationMatch[1]} />;

  const publicEventCheckInMatch = window.location.pathname.match(/^\/event-checkin\/([^/]+)$/);
  if (publicEventCheckInMatch) return <PublicEventCheckInPage slug={publicEventCheckInMatch[1]} />;

  const publicCustomFormMatch = window.location.pathname.match(/^\/forms\/([^/]+)$/);
  if (publicCustomFormMatch) return <PublicCustomFormPage slug={publicCustomFormMatch[1]} />;

  if (window.location.pathname === "/visitor") return <VisitorRegistrationPage />;

  if (window.location.pathname === "/forgot-password") return <ForgotPasswordPage />;

  if (window.location.pathname === "/reset-password") {
    const params = new URLSearchParams(window.location.search);
    return <ResetPasswordPage token={params.get("token") || ""} />;
  }

  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [churchName, setChurchName] = useState<string>("");
  const [churchLogo, setChurchLogo] = useState<string>("");
  const [contextEventId, setContextEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) return;

    loadCurrentUser(session.token)
      .then((user) => {
        const nextSession = { ...session, user };
        setSession(nextSession);
        saveSession(nextSession);
      })
      .catch(() => {
        setSession(null);
        clearSession();
      });
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) {
      setChurchName("");
      setChurchLogo("");
      return;
    }
    loadChurchProfile(session.token)
      .then((profile) => {
        setChurchName(profile.name);
        setChurchLogo(profile.logoDataUrl || "");
      })
      .catch(() => {
        setChurchName("");
        setChurchLogo("");
      });
  }, [session?.token]);

  const handleLogin = (nextSession: AuthSession) => {
    setSession(nextSession);
    saveSession(nextSession);
    const postLoginView = window.localStorage.getItem("ecclesiaos.postLoginView");
    window.localStorage.removeItem("ecclesiaos.postLoginView");
    setCurrentView(postLoginView === "checkin" ? "checkin" : "home");
  };

  const handleLogout = () => {
    setSession(null);
    clearSession();
    setCurrentView("home");
    setContextEventId(null);
  };

  const openEventEditor = (eventId: string) => {
    setContextEventId(eventId);
    setCurrentView("events");
  };

  const createEventFromCalendar = () => {
    setContextEventId(null);
    setCurrentView("events");
  };

  const openServiceOperation = (eventId: string) => {
    setContextEventId(eventId);
    setCurrentView("serviceOps");
  };

  if (!session?.user) return <LoginPage onLogin={handleLogin} />;

  const kidsTotemMatch = window.location.pathname.match(/^\/kids-totem\/([^/]+)$/);
  if (kidsTotemMatch) {
    return (
      <KidsTotemPage
        token={session.token}
        user={session.user}
        eventId={kidsTotemMatch[1]}
        onBack={() => {
          window.history.pushState({}, "", "/");
          setCurrentView("checkin");
        }}
      />
    );
  }

  const eventTotemMatch = window.location.pathname.match(/^\/event-totem\/([^/]+)$/);
  if (eventTotemMatch) {
    return (
      <EventTotemPage
        token={session.token}
        user={session.user}
        eventId={eventTotemMatch[1]}
        onBack={() => {
          window.history.pushState({}, "", "/");
          setCurrentView("events");
        }}
      />
    );
  }

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} user={session.user} churchName={churchName} churchLogo={churchLogo} token={session.token}>
      {currentView === "home" && <HomePage token={session.token} user={session.user} />}
      {currentView === "church" && <ChurchPage token={session.token} user={session.user} />}
      {currentView === "people" && <PeoplePage token={session.token} user={session.user} />}
      {currentView === "groups" && <GroupsPage token={session.token} user={session.user} />}
      {currentView === "attendance" && <AttendancePage token={session.token} user={session.user} />}
      {currentView === "events" && <EventsPage token={session.token} user={session.user} initialEventId={contextEventId} onBackToCalendar={() => setCurrentView("calendar")} />}
      {currentView === "checkin" && <CheckInPage token={session.token} user={session.user} />}
      {currentView === "resources" && <ResourcesPage token={session.token} user={session.user} />}
      {currentView === "calendar" && <CalendarPage token={session.token} user={session.user} onNavigate={setCurrentView} onCreateEvent={createEventFromCalendar} onEditEvent={openEventEditor} onOpenEvent={openServiceOperation} />}
      {currentView === "serving" && <ServingPage token={session.token} user={session.user} />}
      {currentView === "serviceOps" && <ServiceOpsPage token={session.token} user={session.user} onNavigate={setCurrentView} initialEventId={contextEventId} />}
      {currentView === "music" && <MusicPage token={session.token} user={session.user} />}
      {currentView === "liturgy" && <LiturgyPage token={session.token} user={session.user} />}
      {currentView === "forms" && <FormsPage token={session.token} user={session.user} />}
      {currentView === "finance" && <FinancePage token={session.token} user={session.user} />}
      {currentView === "reports" && <ReportsPage token={session.token} user={session.user} />}
      {currentView === "users" && <UsersPage token={session.token} user={session.user} />}
      {currentView === "audit" && <AuditPage token={session.token} user={session.user} />}
      {currentView === "account" && <AccountPage token={session.token} user={session.user} />}
      {currentView === "messages" && <MessagesPage token={session.token} user={session.user} />}
    </AppLayout>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
