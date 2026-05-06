import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";
const defaultFrom = process.env.EMAIL_FROM || "EcclesiaOS <onboarding@resend.dev>";

const client = apiKey ? new Resend(apiKey) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "not_configured" | "missing_to" | "missing_subject" | "provider_error"; error?: string };

export const isEmailConfigured = (): boolean => Boolean(client);

export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  if (!client) return { ok: false, reason: "not_configured" };
  if (!input.to) return { ok: false, reason: "missing_to" };
  if (!input.subject) return { ok: false, reason: "missing_subject" };

  try {
    const response = await client.emails.send({
      from: input.from || defaultFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });
    if (response.error) {
      return { ok: false, reason: "provider_error", error: response.error.message };
    }
    return { ok: true, id: response.data?.id || null };
  } catch (error) {
    return { ok: false, reason: "provider_error", error: error instanceof Error ? error.message : String(error) };
  }
};
