import type { LabelLayout, LabelTemplate, LabelTemplateInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `lbl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const allowedLayouts: LabelLayout[] = ["kids_checkin", "visitor"];

const normalizeInput = (input: LabelTemplateInput): LabelTemplateInput => ({
  name: String(input.name || "").trim() || "Etiqueta sem nome",
  printerModel: String(input.printerModel || "").trim(),
  widthMm: Math.max(0, Number(input.widthMm) || 0),
  heightMm: Math.max(0, Number(input.heightMm) || 0),
  isContinuous: Boolean(input.isContinuous),
  layout: allowedLayouts.includes(input.layout) ? input.layout : "kids_checkin",
  isDefault: Boolean(input.isDefault)
});

const enforceSingleDefault = (templates: LabelTemplate[], targetId: string, layout: LabelLayout, isDefault: boolean): LabelTemplate[] => {
  if (!isDefault) return templates;
  return templates.map((template) => (
    template.layout === layout && template.id !== targetId
      ? { ...template, isDefault: false }
      : template
  ));
};

export const labelTemplateRepository = {
  async list(): Promise<LabelTemplate[]> {
    const data = await readData();
    return [...data.labelTemplates].sort((a, b) => `${a.layout} ${a.name}`.localeCompare(`${b.layout} ${b.name}`));
  },

  async listByLayout(layout: LabelLayout): Promise<LabelTemplate[]> {
    const data = await readData();
    return data.labelTemplates
      .filter((template) => template.layout === layout)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
  },

  async findById(id: string): Promise<LabelTemplate | null> {
    const data = await readData();
    return data.labelTemplates.find((template) => template.id === id) || null;
  },

  async create(input: LabelTemplateInput): Promise<LabelTemplate> {
    const data = await readData();
    const normalized = normalizeInput(input);
    const now = new Date().toISOString();
    const template: LabelTemplate = {
      id: createId(),
      ...normalized,
      createdAt: now,
      updatedAt: now
    };

    const withTemplate = [...data.labelTemplates, template];
    const finalTemplates = enforceSingleDefault(withTemplate, template.id, template.layout, template.isDefault);
    await writeData({ ...data, labelTemplates: finalTemplates });
    return template;
  },

  async update(id: string, input: LabelTemplateInput): Promise<LabelTemplate | null> {
    const data = await readData();
    const existing = data.labelTemplates.find((template) => template.id === id);
    if (!existing) return null;

    const normalized = normalizeInput(input);
    const updated: LabelTemplate = {
      ...existing,
      ...normalized,
      updatedAt: new Date().toISOString()
    };

    const next = data.labelTemplates.map((template) => template.id === id ? updated : template);
    const finalTemplates = enforceSingleDefault(next, id, updated.layout, updated.isDefault);
    await writeData({ ...data, labelTemplates: finalTemplates });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const next = data.labelTemplates.filter((template) => template.id !== id);
    if (next.length === data.labelTemplates.length) return false;

    await writeData({ ...data, labelTemplates: next });
    return true;
  }
};
