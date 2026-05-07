import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download } from "lucide-react";
import type { CurrentUser, GroupProfile, PersonProfile } from "@ecclesiaos/shared";
import { loadGroups, loadPeople } from "./api";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const statusLabels: Record<PersonProfile["status"], string> = {
  member: "Membro",
  visitor: "Visitante"
};

const genderLabels: Record<PersonProfile["gender"], string> = {
  female: "Mulheres",
  male: "Homens",
  unspecified: "Nao informado"
};

const groupTypeLabels: Record<GroupProfile["type"], string> = {
  small_group: "Grupo",
  ministry: "Ministerio",
  class: "Classe",
  team: "Equipe"
};

const fullName = (person: PersonProfile) => `${person.firstName} ${person.lastName}`.trim();

const parseLocalDate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const ageFromBirthDate = (birthDate: string, now = new Date()): number | null => {
  const date = parseLocalDate(birthDate);
  if (!date) return null;
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday = now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const daysUntilBirthday = (birthDate: string, now = new Date()): number | null => {
  const date = parseLocalDate(birthDate);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let nextBirthday = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (nextBirthday < today) nextBirthday = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  return Math.round((nextBirthday.getTime() - today.getTime()) / 86400000);
};

const csvCell = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;

const downloadCsv = (people: PersonProfile[], groups: GroupProfile[]) => {
  const ministryNamesByPerson = new Map<string, string[]>();
  groups.forEach((group) => {
    if (group.type !== "ministry" && group.type !== "team") return;
    group.memberPersonIds.forEach((personId) => {
      const current = ministryNamesByPerson.get(personId) || [];
      ministryNamesByPerson.set(personId, [...current, group.name]);
    });
  });

  const rows = [
    ["Nome", "Status", "Nascimento", "Membrou em", "Genero", "Batismo", "Telefone", "Email", "Ministerios", "Notas"],
    ...people.map((person) => [
      fullName(person),
      statusLabels[person.status],
      person.birthDate,
      person.membershipDate,
      genderLabels[person.gender],
      person.baptized ? "Sim" : "Nao",
      person.phone,
      person.email,
      (ministryNamesByPerson.get(person.id) || []).join("; "),
      person.notes
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ecclesiaos-pessoas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportsPage: React.FC<Props> = ({ token }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([loadPeople(token), loadGroups(token)])
      .then(([peopleData, groupData]) => {
        setPeople(peopleData);
        setGroups(groupData);
        setStatus("");
      })
      .catch(() => setStatus("Nao foi possivel carregar os dados dos relatorios."));
  }, [token]);

  const report = useMemo(() => {
    const members = people.filter((person) => person.status === "member");
    const visitors = people.filter((person) => person.status === "visitor");
    const baptized = members.filter((person) => person.baptized);
    const withMembershipDate = members.filter((person) => person.membershipDate);
    const birthdays = people
      .map((person) => ({ person, days: daysUntilBirthday(person.birthDate) }))
      .filter((item): item is { person: PersonProfile; days: number } => item.days !== null && item.days <= 7)
      .sort((a, b) => a.days - b.days || fullName(a.person).localeCompare(fullName(b.person)));

    const membersByGender = {
      female: members.filter((person) => person.gender === "female").length,
      male: members.filter((person) => person.gender === "male").length,
      unspecified: members.filter((person) => person.gender === "unspecified").length
    };

    const ageBands = members.reduce(
      (acc, person) => {
        const age = ageFromBirthDate(person.birthDate);
        if (age === null) acc.unknown += 1;
        else if (age <= 11) acc.kids += 1;
        else if (age <= 17) acc.teenagers += 1;
        else acc.adults += 1;
        return acc;
      },
      { kids: 0, teenagers: 0, adults: 0, unknown: 0 }
    );

    const ministrySummary = groups
      .filter((group) => group.type === "ministry" || group.type === "team")
      .map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        members: group.memberPersonIds.length,
        positions: group.servicePositions.length
      }))
      .sort((a, b) => b.members - a.members || a.name.localeCompare(b.name));

    return { members, visitors, baptized, withMembershipDate, birthdays, membersByGender, ageBands, ministrySummary };
  }, [people, groups]);

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        icon={BarChart3}
        title="Relatorios"
        description="Indicadores de pessoas, aniversariantes e composicao da membresia."
        actions={(
          <button className="secondary-button" type="button" onClick={() => downloadCsv(people, groups)}>
            <Download size={16} /> Exportar pessoas
          </button>
        )}
      />

      {status && <p className="form-status">{status}</p>}

      <Card>
        <div className="report-grid">
          <article>
            <span>Pessoas</span>
            <strong>{people.length}</strong>
          </article>
          <article>
            <span>Membros</span>
            <strong>{report.members.length}</strong>
          </article>
          <article>
            <span>Visitantes</span>
            <strong>{report.visitors.length}</strong>
          </article>
          <article>
            <span>Batizados</span>
            <strong>{report.baptized.length}</strong>
          </article>
        </div>
      </Card>

      <div className="report-columns">
        <Card>
          <h3>Aniversariantes da semana</h3>
          {report.birthdays.length === 0 ? <p className="muted">Nenhum aniversario nos proximos 7 dias.</p> : report.birthdays.map(({ person, days }) => (
            <p className="report-row" key={person.id}>
              <span>{fullName(person)}</span>
              <strong>{days === 0 ? "Hoje" : `${days} dia${days > 1 ? "s" : ""}`}</strong>
            </p>
          ))}
        </Card>

        <Card>
          <h3>Membros por perfil</h3>
          <p className="report-row"><span>Mulheres</span><strong>{report.membersByGender.female}</strong></p>
          <p className="report-row"><span>Homens</span><strong>{report.membersByGender.male}</strong></p>
          <p className="report-row"><span>Genero nao informado</span><strong>{report.membersByGender.unspecified}</strong></p>
          <p className="report-row"><span>Com data de membresia</span><strong>{report.withMembershipDate.length}</strong></p>
        </Card>
      </div>

      <div className="report-columns">
        <Card>
          <h3>Membros por faixa</h3>
          <p className="report-row"><span>Kids</span><strong>{report.ageBands.kids}</strong></p>
          <p className="report-row"><span>Adolescentes</span><strong>{report.ageBands.teenagers}</strong></p>
          <p className="report-row"><span>Adultos</span><strong>{report.ageBands.adults}</strong></p>
          <p className="report-row"><span>Sem data de nascimento</span><strong>{report.ageBands.unknown}</strong></p>
        </Card>

        <Card>
          <h3>Ministerios e equipes</h3>
          {report.ministrySummary.length === 0 ? <p className="muted">Nenhum ministerio ou equipe cadastrado.</p> : report.ministrySummary.slice(0, 8).map((group) => (
            <p className="report-row" key={group.id}>
              <span>{group.name} <small>({groupTypeLabels[group.type]})</small></span>
              <strong>{group.members} pessoa{group.members === 1 ? "" : "s"}</strong>
            </p>
          ))}
        </Card>
      </div>
    </>
  );
};
