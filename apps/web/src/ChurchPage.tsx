import React, { useEffect, useState } from "react";
import type { ChurchProfile, ChurchProfileUpdate, CurrentUser } from "@ecclesiaos/shared";
import { loadChurchProfile, updateChurchProfile } from "./api";
import { toChurchUpdate } from "./mappers";

interface Props {
  token: string;
  user: CurrentUser;
}

export const ChurchPage: React.FC<Props> = ({ token, user }) => {
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [churchForm, setChurchForm] = useState<ChurchProfileUpdate | null>(null);
  const [churchStatus, setChurchStatus] = useState("");

  useEffect(() => {
    loadChurchProfile(token)
      .then((profile) => {
        setChurch(profile);
        setChurchForm(toChurchUpdate(profile));
      })
      .catch(() => setChurchStatus("Nao foi possivel carregar o cadastro da igreja."));
  }, [token]);

  const updateChurchField = (field: keyof ChurchProfileUpdate, value: string) => {
    setChurchForm((current) => current ? { ...current, [field]: value } : current);
  };

  const handleChurchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!churchForm) return;

    setChurchStatus("Salvando...");
    try {
      const profile = await updateChurchProfile(token, churchForm);
      setChurch(profile);
      setChurchForm(toChurchUpdate(profile));
      setChurchStatus("Cadastro salvo.");
    } catch {
      setChurchStatus("Nao foi possivel salvar. Verifique sua permissao.");
    }
  };

  return (
    <section className="panel church-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Igreja unica</p>
          <h2>Cadastro da igreja</h2>
        </div>
        {church && <span className="profile-pill">{church.name}</span>}
      </div>

      {churchForm ? (
        <form className="church-form" onSubmit={handleChurchSubmit}>
          <label>Nome<input disabled={user.role !== "admin"} value={churchForm.name} onChange={(event) => updateChurchField("name", event.target.value)} /></label>
          <label>Email<input disabled={user.role !== "admin"} value={churchForm.email} onChange={(event) => updateChurchField("email", event.target.value)} /></label>
          <label>Telefone<input disabled={user.role !== "admin"} value={churchForm.phone} onChange={(event) => updateChurchField("phone", event.target.value)} /></label>
          <label>Site<input disabled={user.role !== "admin"} value={churchForm.website} onChange={(event) => updateChurchField("website", event.target.value)} /></label>
          <label className="wide-field">Canal do YouTube<input disabled={user.role !== "admin"} value={churchForm.youtubeChannelUrl} onChange={(event) => updateChurchField("youtubeChannelUrl", event.target.value)} placeholder="https://www.youtube.com/channel/..." /></label>
          <label>Endereco<input disabled={user.role !== "admin"} value={churchForm.addressLine1} onChange={(event) => updateChurchField("addressLine1", event.target.value)} /></label>
          <label>Complemento<input disabled={user.role !== "admin"} value={churchForm.addressLine2} onChange={(event) => updateChurchField("addressLine2", event.target.value)} /></label>
          <label>Cidade<input disabled={user.role !== "admin"} value={churchForm.city} onChange={(event) => updateChurchField("city", event.target.value)} /></label>
          <label>Estado<input disabled={user.role !== "admin"} value={churchForm.state} onChange={(event) => updateChurchField("state", event.target.value)} /></label>
          <label>CEP<input disabled={user.role !== "admin"} value={churchForm.postalCode} onChange={(event) => updateChurchField("postalCode", event.target.value)} /></label>
          <label>Pais<input disabled={user.role !== "admin"} value={churchForm.country} onChange={(event) => updateChurchField("country", event.target.value)} /></label>

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">Salvar cadastro</button>}
            <p>{user.role === "admin" ? churchStatus : "Somente administradores podem editar este cadastro."}</p>
          </div>
        </form>
      ) : (
        <p className="muted">{churchStatus || "Carregando cadastro..."}</p>
      )}
    </section>
  );
};
