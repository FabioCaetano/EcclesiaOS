import type { CustomForm, CustomFormField, CustomFormInput, CustomFormResponse, CustomFormSubmissionInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createFormId = () => `form_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createFieldId = () => `field_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createResponseId = () => `resp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `formulario-${Date.now()}`;

const normalizeFields = (fields: CustomFormField[]): CustomFormField[] => (
  (Array.isArray(fields) ? fields : [])
    .map((field, index) => ({
      id: String(field.id || "").trim() || createFieldId(),
      label: String(field.label || "").trim(),
      type: ["textarea", "email", "phone", "number", "date", "select", "checkbox"].includes(field.type) ? field.type : "text",
      required: Boolean(field.required),
      options: Array.isArray(field.options) ? field.options.map((option) => String(option || "").trim()).filter(Boolean) : [],
      order: Math.max(1, Number(field.order) || index + 1)
    }))
    .filter((field) => field.label)
    .sort((a, b) => a.order - b.order)
    .map((field, index) => ({ ...field, order: index + 1 }))
);

const normalizeInput = (input: CustomFormInput, existingForms: CustomForm[], currentId = ""): CustomFormInput => {
  const baseSlug = slugify(input.slug || input.title);
  const existingSlugs = new Set(existingForms.filter((form) => form.id !== currentId).map((form) => form.slug));
  let slug = baseSlug;
  let index = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return {
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    slug,
    responsiblePersonIds: Array.isArray(input.responsiblePersonIds) ? [...new Set(input.responsiblePersonIds.map(String).filter(Boolean))] : [],
    fields: normalizeFields(input.fields),
    isActive: input.isActive !== false
  };
};

const validateAnswers = (form: CustomForm, input: CustomFormSubmissionInput): Record<string, string> | null => {
  const answers = input.answers && typeof input.answers === "object" ? input.answers : {};
  const normalized: Record<string, string> = {};

  for (const field of form.fields) {
    const value = String(answers[field.id] || "").trim();
    if (field.required && !value) return null;
    if (field.type === "select" && value && field.options.length > 0 && !field.options.includes(value)) return null;
    normalized[field.id] = value;
  }

  return normalized;
};

export const customFormRepository = {
  async listForms(): Promise<CustomForm[]> {
    const data = await readData();
    return [...data.customForms].sort((a, b) => a.title.localeCompare(b.title));
  },

  async createForm(input: CustomFormInput): Promise<CustomForm> {
    const data = await readData();
    const now = new Date().toISOString();
    const form: CustomForm = {
      id: createFormId(),
      ...normalizeInput(input, data.customForms),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, customForms: [...data.customForms, form] });
    return form;
  },

  async updateForm(id: string, input: CustomFormInput): Promise<CustomForm | null> {
    const data = await readData();
    const existing = data.customForms.find((form) => form.id === id);
    if (!existing) return null;

    const updated: CustomForm = {
      ...existing,
      ...normalizeInput(input, data.customForms, id),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, customForms: data.customForms.map((form) => form.id === id ? updated : form) });
    return updated;
  },

  async removeForm(id: string): Promise<boolean> {
    const data = await readData();
    const nextForms = data.customForms.filter((form) => form.id !== id);
    if (nextForms.length === data.customForms.length) return false;

    await writeData({
      ...data,
      customForms: nextForms,
      customFormResponses: data.customFormResponses.filter((response) => response.formId !== id)
    });
    return true;
  },

  async listResponses(formId?: string): Promise<CustomFormResponse[]> {
    const data = await readData();
    return data.customFormResponses
      .filter((response) => !formId || response.formId === formId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  async findPublicForm(slug: string): Promise<CustomForm | null> {
    const data = await readData();
    return data.customForms.find((form) => form.slug === slug && form.isActive) || null;
  },

  async submit(slug: string, input: CustomFormSubmissionInput): Promise<CustomFormResponse | null> {
    const data = await readData();
    const form = data.customForms.find((item) => item.slug === slug && item.isActive);
    if (!form) return null;

    const answers = validateAnswers(form, input);
    if (!answers) throw new Error("invalid_answers");

    const response: CustomFormResponse = {
      id: createResponseId(),
      formId: form.id,
      answers,
      submittedAt: new Date().toISOString()
    };

    await writeData({ ...data, customFormResponses: [...data.customFormResponses, response] });
    return response;
  }
};
