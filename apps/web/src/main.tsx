import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import type { AuthSession } from "@ecclesiaos/shared";
import { AppLayout } from "./AppLayout";
import { AttendancePage } from "./AttendancePage";
import { AuditPage } from "./AuditPage";
import { CalendarPage } from "./CalendarPage";
import { clearSession, loadCurrentUser, loadStoredSession, saveSession } from "./api";
import { ChurchPage } from "./ChurchPage";
import { CheckInPage } from "./CheckInPage";
import { FinancePage } from "./FinancePage";
import { EventsPage } from "./EventsPage";
import { GroupsPage } from "./GroupsPage";
import { HomePage } from "./HomePage";
import { LoginPage } from "./LoginPage";
import { PeoplePage } from "./PeoplePage";
import { PublicRegistrationPage } from "./PublicRegistrationPage";
import { ResourcesPage } from "./ResourcesPage";
import { ServingPage } from "./ServingPage";
import { UsersPage } from "./UsersPage";
import type { AppView } from "./types";
import "./styles.css";

const App = () => {
  const publicRegistrationMatch = window.location.pathname.match(/^\/register\/([^/]+)$/);
  if (publicRegistrationMatch) return <PublicRegistrationPage slug={publicRegistrationMatch[1]} />;

  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [currentView, setCurrentView] = useState<AppView>("home");

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

  const handleLogin = (nextSession: AuthSession) => {
    setSession(nextSession);
    saveSession(nextSession);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setSession(null);
    clearSession();
    setCurrentView("home");
  };

  if (!session?.user) return <LoginPage onLogin={handleLogin} />;

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} user={session.user}>
      {currentView === "home" && <HomePage token={session.token} user={session.user} />}
      {currentView === "church" && <ChurchPage token={session.token} user={session.user} />}
      {currentView === "people" && <PeoplePage token={session.token} user={session.user} />}
      {currentView === "groups" && <GroupsPage token={session.token} user={session.user} />}
      {currentView === "attendance" && <AttendancePage token={session.token} user={session.user} />}
      {currentView === "events" && <EventsPage token={session.token} user={session.user} />}
      {currentView === "checkin" && <CheckInPage token={session.token} user={session.user} />}
      {currentView === "resources" && <ResourcesPage token={session.token} user={session.user} />}
      {currentView === "calendar" && <CalendarPage token={session.token} user={session.user} />}
      {currentView === "serving" && <ServingPage token={session.token} user={session.user} />}
      {currentView === "finance" && <FinancePage token={session.token} user={session.user} />}
      {currentView === "users" && <UsersPage token={session.token} user={session.user} />}
      {currentView === "audit" && <AuditPage token={session.token} user={session.user} />}
    </AppLayout>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
