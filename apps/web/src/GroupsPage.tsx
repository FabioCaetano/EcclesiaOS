import React, { useEffect, useMemo, useState } from "react";
import { Plus, UsersRound, X } from "lucide-react";
import type { CurrentUser, GroupInput, GroupProfile, PersonProfile } from "@ecclesiaos/shared";
import { deleteGroup, loadGroups, loadPeople, saveGroup } from "./api";
import { emptyGroupInput, groupTypeLabels } from "./constants";
import { toGroupInput } from "./mappers";
import { Card, EmptyState, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const PEOPLE_DATALIST_ID = "groups-people-options";

const personFullName = (person: PersonProfile) => `${person.firstName} ${person.lastName}`.trim();

const groupIsVisibleTo = (group: GroupProfile, user: CurrentUser): boolean => {
  if (user.role === "admin") return true;
  if (!user.personId) return false;
  if (group.leaderPersonId === user.personId) return true;
  return group.memberPersonIds.includes(user.personId);
};

export const GroupsPage: React.FC<Props> = ({ token, user }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupInput>(emptyGroupInput);
  const [groupStatus, setGroupStatus] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const isAdmin = user.role === "admin";
  const canManage = isAdmin;

  const refreshGroups = async () => setGroups(await loadGroups(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setGroupStatus("Nao foi possivel carregar pessoas."));
    refreshGroups().catch(() => setGroupStatus("Nao foi possivel carregar grupos."));
  }, [token]);

  const visibleGroups = useMemo(() => groups.filter((group) => groupIsVisibleTo(group, user)), [groups, user]);
  const peopleByName = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((person) => {
      const name = personFullName(person);
      if (name) map.set(name.toLowerCase(), person.id);
    });
    return map;
  }, [people]);
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

  const selectGroup = (group: GroupProfile) => {
    setSelectedGroupId(group.id);
    setGroupForm(toGroupInput(group));
    setGroupStatus("");
    setMemberSearch("");
  };

  const startNewGroup = () => {
    setSelectedGroupId(null);
    setGroupForm(emptyGroupInput);
    setGroupStatus("");
    setMemberSearch("");
  };

  const updateGroupField = (field: keyof GroupInput, value: string) => {
    setGroupForm((current) => ({ ...current, [field]: value }));
  };

  const addPosition = () => {
    setGroupForm((current) => ({
      ...current,
      servicePositions: [...current.servicePositions, ""]
    }));
  };

  const updatePosition = (index: number, value: string) => {
    setGroupForm((current) => ({
      ...current,
      servicePositions: current.servicePositions.map((position, idx) => idx === index ? value : position)
    }));
  };

  const removePosition = (index: number) => {
    setGroupForm((current) => {
      const removed = current.servicePositions[index];
      const nextPositions = current.servicePositions.filter((_, idx) => idx !== index);
      const nextMemberPositions: Record<string, string[]> = {};
      Object.entries(current.memberServicePositions).forEach(([personId, positions]) => {
        nextMemberPositions[personId] = positions.filter((position) => position !== removed);
      });
      return {
        ...current,
        servicePositions: nextPositions,
        memberServicePositions: nextMemberPositions
      };
    });
  };

  const addMember = (personId: string) => {
    if (!personId) return;
    setGroupForm((current) => {
      if (current.memberPersonIds.includes(personId)) return current;
      return {
        ...current,
        memberPersonIds: [...current.memberPersonIds, personId]
      };
    });
  };

  const removeMember = (personId: string) => {
    setGroupForm((current) => {
      const memberPersonIds = current.memberPersonIds.filter((id) => id !== personId);
      const memberServicePositions = { ...current.memberServicePositions };
      delete memberServicePositions[personId];
      return { ...current, memberPersonIds, memberServicePositions };
    });
  };

  const toggleMemberPosition = (personId: string, position: string) => {
    setGroupForm((current) => {
      const currentPositions = current.memberServicePositions[personId] || [];
      const exists = currentPositions.includes(position);
      const nextPositions = exists ? currentPositions.filter((item) => item !== position) : [...currentPositions, position];
      return {
        ...current,
        memberServicePositions: {
          ...current.memberServicePositions,
          [personId]: nextPositions
        }
      };
    });
  };

  const submitMemberFromSearch = () => {
    const trimmed = memberSearch.trim();
    if (!trimmed) return;
    const matchedId = peopleByName.get(trimmed.toLowerCase());
    if (!matchedId) {
      setGroupStatus("Pessoa nao encontrada.");
      return;
    }
    addMember(matchedId);
    setMemberSearch("");
    setGroupStatus("");
  };

  const handleGroupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;

    const cleanedPositions = groupForm.servicePositions.map((position) => position.trim()).filter(Boolean);
    const cleanedMemberPositions: Record<string, string[]> = {};
    Object.entries(groupForm.memberServicePositions).forEach(([personId, positions]) => {
      const filtered = positions.filter((position) => cleanedPositions.includes(position));
      if (filtered.length > 0) cleanedMemberPositions[personId] = filtered;
    });
    const payload: GroupInput = {
      ...groupForm,
      servicePositions: cleanedPositions,
      memberServicePositions: cleanedMemberPositions
    };

    setGroupStatus("Salvando...");
    try {
      const saved = await saveGroup(token, payload, selectedGroupId || undefined);
      await refreshGroups();
      selectGroup(saved);
      setGroupStatus("Grupo salvo.");
    } catch {
      setGroupStatus("Nao foi possivel salvar o grupo.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId || !canManage) return;
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

  const isMinistryOrTeam = groupForm.type === "ministry" || groupForm.type === "team";
  const positionsLabel = isMinistryOrTeam ? "Posicoes" : "Posicoes de servico";

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        icon={UsersRound}
        title="Grupos e ministerios"
        description="Pequenos grupos, ministerios, classes e equipes."
        actions={canManage && (
          <button className="secondary-button" type="button" onClick={startNewGroup}>
            <Plus size={16} /> Novo grupo
          </button>
        )}
      />

      <Card className="groups-panel">
      <datalist id={PEOPLE_DATALIST_ID}>
        {people.map((person) => <option key={person.id} value={personFullName(person)} />)}
      </datalist>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de grupos">
          {visibleGroups.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Sem grupos visiveis"
              description={isAdmin ? "Crie pequenos grupos, ministerios ou equipes." : "Voce ainda nao participa de nenhum grupo. Peca ao admin para incluir voce."}
            />
          ) : visibleGroups.map((group) => (
            <button className={group.id === selectedGroupId ? "person-row selected" : "person-row"} key={group.id} type="button" onClick={() => selectGroup(group)}>
              <strong>{group.name}</strong>
              <span>
                {groupTypeLabels[group.type]} - {group.memberPersonIds.length} pessoa(s)
                {(group.type === "ministry" || group.type === "team") && group.servicePositions?.length > 0 ? ` - ${group.servicePositions.length} posicao(oes)` : ""}
              </span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleGroupSubmit}>
          <label>Nome<input disabled={!canManage} value={groupForm.name} onChange={(event) => updateGroupField("name", event.target.value)} /></label>
          <label>
            Tipo
            <select disabled={!canManage} value={groupForm.type} onChange={(event) => updateGroupField("type", event.target.value)}>
              <option value="small_group">Grupo pequeno</option>
              <option value="ministry">Ministerio</option>
              <option value="class">Classe</option>
              <option value="team">Equipe</option>
            </select>
          </label>
          <label>
            Lider
            <select disabled={!canManage} value={groupForm.leaderPersonId} onChange={(event) => updateGroupField("leaderPersonId", event.target.value)}>
              <option value="">Sem lider</option>
              {people.map((person) => (
                <option value={person.id} key={person.id}>{personFullName(person)}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">Descricao<textarea disabled={!canManage} value={groupForm.description} onChange={(event) => updateGroupField("description", event.target.value)} /></label>

          {isMinistryOrTeam && (
            <fieldset className="wide-field groups-positions">
              <legend>{positionsLabel}</legend>
              {groupForm.servicePositions.length === 0 && (
                <span className="muted">Nenhuma posicao cadastrada. Use o botao abaixo para adicionar.</span>
              )}
              <div className="groups-positions-list">
                {groupForm.servicePositions.map((position, index) => (
                  <span className="group-position-chip" key={index}>
                    <input
                      disabled={!canManage}
                      value={position}
                      placeholder="Ex.: Vocal"
                      onChange={(event) => updatePosition(index, event.target.value)}
                    />
                    {canManage && (
                      <button type="button" className="forms-chip-remove" aria-label="Remover posicao" onClick={() => removePosition(index)}>
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {canManage && (
                  <button type="button" className="secondary-button" onClick={addPosition}>
                    <Plus size={14} /> Posicao
                  </button>
                )}
              </div>
            </fieldset>
          )}

          <fieldset className="wide-field groups-members">
            <legend>Membros</legend>
            {canManage && (
              <div className="groups-members-add">
                <input
                  list={PEOPLE_DATALIST_ID}
                  placeholder="Buscar pessoa..."
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitMemberFromSearch(); } }}
                />
                <button type="button" className="secondary-button" onClick={submitMemberFromSearch} disabled={!memberSearch.trim()}>
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            )}

            {groupForm.memberPersonIds.length === 0 ? (
              <p className="muted">Nenhum membro adicionado{canManage ? "" : "."}{canManage ? ". Pesquise uma pessoa acima." : ""}</p>
            ) : (
              <div className="groups-members-grid">
                {groupForm.memberPersonIds.map((personId) => {
                  const person = peopleById.get(personId);
                  const memberPositions = groupForm.memberServicePositions[personId] || [];
                  return (
                    <div className="group-member-chip" key={personId}>
                      <header>
                        <strong>{person ? personFullName(person) : "Pessoa removida"}</strong>
                        {canManage && (
                          <button type="button" className="forms-chip-remove" aria-label="Remover membro" onClick={() => removeMember(personId)}>
                            <X size={12} />
                          </button>
                        )}
                      </header>
                      {isMinistryOrTeam && groupForm.servicePositions.length > 0 && (
                        <div className="group-member-positions">
                          {groupForm.servicePositions.filter(Boolean).map((position) => {
                            const active = memberPositions.includes(position);
                            return (
                              <button
                                type="button"
                                key={position}
                                className={`group-position-toggle${active ? " active" : ""}`}
                                onClick={() => canManage && toggleMemberPosition(personId, position)}
                                disabled={!canManage}
                              >
                                {position}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>

          <div className="form-footer">
            {canManage && <button type="submit">{selectedGroupId ? "Salvar grupo" : "Criar grupo"}</button>}
            {canManage && selectedGroupId && <button className="danger-button" type="button" onClick={handleDeleteGroup}>Remover</button>}
            <p>{canManage ? groupStatus : "Somente administradores podem alterar grupos."}</p>
          </div>
        </form>
      </div>
      </Card>
    </>
  );
};
