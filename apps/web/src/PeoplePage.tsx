import React, { useEffect, useState } from "react";
import type { CurrentUser, LabelTemplate, PersonInput, PersonProfile } from "@ecclesiaos/shared";
import { deletePerson, loadLabelTemplates, loadPeople, savePerson } from "./api";
import { emptyPersonInput } from "./constants";
import { toPersonInput } from "./mappers";

interface Props {
  token: string;
  user: CurrentUser;
}

const labelPageStyle = (template: LabelTemplate): string => {
  const width = Math.max(10, Number(template.widthMm) || 62);
  if (template.isContinuous) {
    return `@page { size: ${width}mm auto; margin: 0; }`;
  }
  const height = Math.max(10, Number(template.heightMm) || 100);
  return `@page { size: ${width}mm ${height}mm; margin: 0; }`;
};

export const PeoplePage: React.FC<Props> = ({ token, user }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState<PersonInput>(emptyPersonInput);
  const [peopleStatus, setPeopleStatus] = useState("");
  const [visitorTemplate, setVisitorTemplate] = useState<LabelTemplate | null>(null);
  const [printingPerson, setPrintingPerson] = useState<PersonProfile | null>(null);

  const refreshPeople = async () => setPeople(await loadPeople(token));

  useEffect(() => {
    refreshPeople().catch(() => setPeopleStatus("Nao foi possivel carregar pessoas."));
  }, [token]);

  useEffect(() => {
    loadLabelTemplates(token, "visitor")
      .then((templates) => {
        const preferred = templates.find((template) => template.isDefault) || templates[0] || null;
        setVisitorTemplate(preferred);
      })
      .catch(() => setVisitorTemplate(null));
  }, [token]);

  useEffect(() => {
    if (!printingPerson) return;
    const onAfterPrint = () => setPrintingPerson(null);
    window.addEventListener("afterprint", onAfterPrint);
    const timer = window.setTimeout(() => window.print(), 50);
    return () => {
      window.removeEventListener("afterprint", onAfterPrint);
      window.clearTimeout(timer);
    };
  }, [printingPerson]);

  const selectPerson = (person: PersonProfile) => {
    setSelectedPersonId(person.id);
    setPersonForm(toPersonInput(person));
    setPeopleStatus("");
  };

  const startNewPerson = () => {
    setSelectedPersonId(null);
    setPersonForm(emptyPersonInput);
    setPeopleStatus("");
  };

  const updatePersonField = (field: keyof PersonInput, value: string) => {
    setPersonForm((current) => ({ ...current, [field]: field === "status" && value === "visitor" ? "visitor" : value }));
  };

  const toggleGuardian = (personId: string) => {
    setPersonForm((current) => {
      const currentIds = current.guardianPersonIds || [];
      return {
        ...current,
        guardianPersonIds: currentIds.includes(personId)
          ? currentIds.filter((id) => id !== personId)
          : [...currentIds, personId]
      };
    });
  };

  const handlePersonSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setPeopleStatus("Salvando...");
    try {
      const saved = await savePerson(token, personForm, selectedPersonId || undefined);
      await refreshPeople();
      selectPerson(saved);
      setPeopleStatus("Pessoa salva.");
    } catch {
      setPeopleStatus("Nao foi possivel salvar a pessoa.");
    }
  };

  const handleDeletePerson = async () => {
    if (!selectedPersonId || user.role !== "admin") return;
    if (!window.confirm("Remover esta pessoa?")) return;

    setPeopleStatus("Removendo...");
    try {
      await deletePerson(token, selectedPersonId);
      await refreshPeople();
      startNewPerson();
      setPeopleStatus("Pessoa removida.");
    } catch {
      setPeopleStatus("Nao foi possivel remover a pessoa.");
    }
  };

  return (
    <section className="panel people-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Pessoas</p>
          <h2>Cadastro de pessoas</h2>
        </div>
        {user.role === "admin" && <button className="secondary-button" type="button" onClick={startNewPerson}>Nova pessoa</button>}
      </div>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de pessoas">
          {people.map((person) => (
            <button className={person.id === selectedPersonId ? "person-row selected" : "person-row"} key={person.id} type="button" onClick={() => selectPerson(person)}>
              <strong>{person.firstName} {person.lastName}</strong>
              <span>{person.status === "member" ? "Membro" : "Visitante"} - {person.email || "sem email"}</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handlePersonSubmit}>
          <label>Nome<input disabled={user.role !== "admin"} value={personForm.firstName} onChange={(event) => updatePersonField("firstName", event.target.value)} /></label>
          <label>Sobrenome<input disabled={user.role !== "admin"} value={personForm.lastName} onChange={(event) => updatePersonField("lastName", event.target.value)} /></label>
          <label>Email<input disabled={user.role !== "admin"} value={personForm.email} onChange={(event) => updatePersonField("email", event.target.value)} /></label>
          <label>Telefone<input disabled={user.role !== "admin"} value={personForm.phone} onChange={(event) => updatePersonField("phone", event.target.value)} /></label>
          <label>Nascimento<input disabled={user.role !== "admin"} type="date" value={personForm.birthDate} onChange={(event) => updatePersonField("birthDate", event.target.value)} /></label>
          <label>
            Status
            <select disabled={user.role !== "admin"} value={personForm.status} onChange={(event) => updatePersonField("status", event.target.value)}>
              <option value="member">Membro</option>
              <option value="visitor">Visitante</option>
            </select>
          </label>
          <label className="wide-field">Observacoes internas<textarea disabled={user.role !== "admin"} value={personForm.notes} onChange={(event) => updatePersonField("notes", event.target.value)} /></label>
          <fieldset className="member-picker">
            <legend>Responsaveis vinculados</legend>
            {people.filter((person) => person.id !== selectedPersonId).map((person) => (
              <label key={person.id}>
                <input
                  checked={(personForm.guardianPersonIds || []).includes(person.id)}
                  disabled={user.role !== "admin"}
                  type="checkbox"
                  onChange={() => toggleGuardian(person.id)}
                />
                {person.firstName} {person.lastName}
              </label>
            ))}
          </fieldset>

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedPersonId ? "Salvar pessoa" : "Criar pessoa"}</button>}
            {user.role === "admin" && selectedPersonId && <button className="danger-button" type="button" onClick={handleDeletePerson}>Remover</button>}
            {selectedPersonId && visitorTemplate && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  const target = people.find((person) => person.id === selectedPersonId);
                  if (target) setPrintingPerson(target);
                }}
              >
                Imprimir etiqueta visitante
              </button>
            )}
            <p>{user.role === "admin" ? peopleStatus : "Somente administradores podem alterar pessoas."}</p>
          </div>
        </form>
      </div>

      {printingPerson && visitorTemplate && (
        <div className="label-test-print">
          <style>{labelPageStyle(visitorTemplate)}</style>
          <div className="child-label-card child-label-print-area single-label-print-area">
            <p className="eyebrow">EcclesiaOS Visitante</p>
            <h3>{printingPerson.firstName} {printingPerson.lastName}</h3>
            <p>{printingPerson.email || "Sem email"}</p>
            <p>{printingPerson.phone || "Sem telefone"}</p>
            <p>Bem-vindo!</p>
          </div>
        </div>
      )}
    </section>
  );
};
