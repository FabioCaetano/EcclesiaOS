import React, { useState } from "react";
import type { AuthSession, RegisterRequest } from "@ecclesiaos/shared";
import { login, register } from "./api";
import { demoAccounts, emptyRegisterRequest } from "./constants";

interface Props {
  onLogin: (session: AuthSession) => void;
}

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const visitorKidsEntry = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("visitorKids") === "1";
  const [email, setEmail] = useState("admin@ecclesiaos.local");
  const [password, setPassword] = useState("admin123");
  const [mode, setMode] = useState<"login" | "register">(visitorKidsEntry ? "register" : "login");
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(visitorKidsEntry ? { ...emptyRegisterRequest, status: "visitor" } : emptyRegisterRequest);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const registerLead = registerForm.status === "visitor"
    ? "Crie uma conta de visitante para cadastrar criancas e gerar o QR do Check-in Kids."
    : "Novos membros entram como membros ate revisao administrativa.";

  const startVisitorKidsRegistration = () => {
    setError("");
    setMode("register");
    setRegisterForm({ ...emptyRegisterRequest, status: "visitor" });
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      onLogin(await login({ email, password }));
    } catch {
      setError("Email ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  };

  const updateRegisterField = (field: keyof RegisterRequest, value: string) => {
    setRegisterForm((current) => ({
      ...current,
      [field]: field === "status" && value === "visitor" ? "visitor" : field === "status" ? "member" : value
    }));
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const nextSession = await register(registerForm);
      if (registerForm.status === "visitor") {
        window.localStorage.setItem("ecclesiaos.postLoginView", "checkin");
      }
      onLogin(nextSession);
    } catch (registerError) {
      setError(registerError instanceof Error && registerError.message === "duplicate-register" ? "Ja existe uma conta com este email." : "Nao foi possivel criar sua conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">EcclesiaOS</p>
        <h1>{mode === "login" ? "Acesse sua conta" : "Crie sua conta"}</h1>
        <p className="lead">{mode === "login" ? "Administradores, lideres, membros e visitantes entram pelo mesmo portal." : registerLead}</p>

        {mode === "login" ? (
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
            </label>
            <label>
              Senha
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            <label>Nome<input value={registerForm.firstName} onChange={(event) => updateRegisterField("firstName", event.target.value)} autoComplete="given-name" /></label>
            <label>Sobrenome<input value={registerForm.lastName} onChange={(event) => updateRegisterField("lastName", event.target.value)} autoComplete="family-name" /></label>
            <label>Email<input value={registerForm.email} onChange={(event) => updateRegisterField("email", event.target.value)} type="email" autoComplete="email" /></label>
            <label>Telefone<input value={registerForm.phone} onChange={(event) => updateRegisterField("phone", event.target.value)} autoComplete="tel" /></label>
            <label>
              Cadastro como
              <select value={registerForm.status} onChange={(event) => updateRegisterField("status", event.target.value)}>
                <option value="member">Membro</option>
                <option value="visitor">Visitante</option>
              </select>
            </label>
            {registerForm.status === "visitor" && (
              <p className="auth-helper">Visitantes acessam o Check-in Kids para cadastrar criancas e gerar QR. As demais areas permanecem restritas.</p>
            )}
            <label>Senha<input value={registerForm.password} onChange={(event) => updateRegisterField("password", event.target.value)} type="password" autoComplete="new-password" /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
          </form>
        )}

        <button className="text-button auth-toggle" type="button" onClick={() => {
          setError("");
          setMode(mode === "login" ? "register" : "login");
        }}>
          {mode === "login" ? "Criar nova conta" : "Ja tenho conta"}
        </button>

        {mode === "login" && (
          <a className="text-button auth-toggle" href="/forgot-password">Esqueci minha senha</a>
        )}

        {mode === "login" && (
          <button className="text-button auth-toggle visitor-kids-link" type="button" onClick={startVisitorKidsRegistration}>
            Visitante com crianca
          </button>
        )}

        {mode === "login" && <div className="demo-accounts">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
            >
              {account.label}
            </button>
          ))}
        </div>}
      </section>
    </main>
  );
};
