import React, { useEffect, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import type { CurrentUser, GroupInput, GroupProfile, PersonProfile } from "@ecclesiaos/shared";
import { deleteGroup, loadGroups, loadPeople, saveGroup } from "./api";
import { emptyGroupInput, groupTypeLabels } from "./constants";
import { toGroupInput } from "./mappers";
import { Card, EmptyState, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

export const GroupsPage: React.FC<Props> = ({ token, user }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupInput>(emptyGroupInput);
  const [groupStatus, setGroupStatus] = useState("");

  const refreshGroups = async () => setGroups(await loadGroups(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setGroupStatus("Nao foi possivel carregar pessoas."));
    refreshGroups().catch(() => setGroupStatus("Nao foi possivel carregar grupos."));
  }, [token]);

  const selectGroup = (group: GroupProfile) => {
    setSelectedGroupId(group.id);
    setGroupForm(toGroupInput(group));
    setGroupStatus("");
  };

  const startNewGroup = () => {
    setSelectedGroupId(null);
    setGroupForm(emptyGroupInput);
    setGroupStatus("");
  };

  const updateGroupField = (field: keyof GroupInput, value: string) => {
    setGroupForm((current) => ({ ...current, [field]: value }));
  };

  const toggleGroupMember = (personId: string) => {
    setGroupForm((current) => {
      const exists = current.memberPersonIds.includes(personId);
      const memberPersonIds = exists ? current.memberPersonIds.filter((id) => id !== personId) : [...current.memberPersonIds, personId];
      return { ...current, memberPersonIds };
    });
  };

  const handleGroupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setGroupStatus("Salvando...");
    try {
      const saved = await saveGroup(token, groupForm, selectedGroupId || undefined);
      await refreshGroups();
      selectGroup(saved);
      setGroupStatus("Grupo salvo.");
    } catch {
      setGroupStatus("Nao foi possivel salvar o grupo.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId || user.role !== "admin") return;
    if (!window.confirm("Remover este grupo?")) return;

    setGroupStatus("Removendo...");
    try {
      await deleteGroup(token, selectedGroupId);
      await refreshGroups();
      startNewGroup();
      setGroupStatus("Grupo removido.");
    } catch {
      setGroupStatus("Nao foi possivel remover o grupo.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        icon={UsersRound}
        title="Grupos e ministerios"
        description="Pequenos grupos, ministerios, classes e equipes."
        actions={user.role === "admin" && (
          <button className="secondary-button" type="button" onClick={startNewGroup}>
            <Plus size={16} /> Novo grupo
          </button>
        )}
      />

      <Card className="groups-panel">
      <div className="people-layout">
        <div className="people-list" aria-label="Lista de grupos">
          {groups.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Sem grupos cadastrados"
              description={user.role === "admin" ? "Crie pequenos grupos, ministerios ou equipes." : "Aguarde o admin cadastrar grupos."}
            />
          ) : groups.map((group) => (
            <button className={group.id === selectedGroupId ? "person-row selected" : "person-row"} key={group.id} type="button" onClick={() => selectGroup(group)}>
              <strong>{group.name}</strong>
              <span>{groupTypeLabels[group.type]} - {group.memberPersonIds.length} pessoa(s)</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleGroupSubmit}>
          <label>Nome<input disabled={user.role !== "admin"} value={groupForm.name} onChange={(event) => updateGroupField("name", event.target.value)} /></label>
          <label>
            Tipo
            <select disabled={user.role !== "admin"} value={groupForm.type} onChange={(event) => updateGroupField("type", event.target.value)}>
              <option value="small_group">Grupo pequeno</option>
              <option value="ministry">Ministerio</option>
              <option value="class">Classe</option>
              <option value="team">Equipe</option>
            </select>
          </label>
          <label>
            Lider
            <select disabled={user.role !== "admin"} value={groupForm.leaderPersonId} onChange={(event) => updateGroupField("leaderPersonId", event.target.value)}>
              <option value="">Sem lider</option>
              {people.map((person) => (
                <option value={person.id} key={person.id}>{person.firstName} {person.lastName}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">Descricao<textarea disabled={user.role !== "admin"} value={groupForm.description} onChange={(event) => updateGroupField("description", event.target.value)} /></label>

          <fieldset className="member-picker">
            <legend>Membros</legend>
            {people.map((person) => (
              <label key={person.id}>
                <input disabled={user.role !== "admin"} type="checkbox" checked={groupForm.memberPersonIds.includes(person.id)} onChange={() => toggleGroupMember(person.id)} />
                {person.firstName} {person.lastName}
              </label>
            ))}
          </fieldset>

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedGroupId ? "Salvar grupo" : "Criar grupo"}</button>}
            {user.role === "admin" && selectedGroupId && <button className="danger-button" type="button" onClick={handleDeleteGroup}>Remover</button>}
            <p>{user.role === "admin" ? groupStatus : "Somente administradores podem alterar grupos."}</p>
          </div>
        </form>
      </div>
      </Card>
    </>
  );
};
