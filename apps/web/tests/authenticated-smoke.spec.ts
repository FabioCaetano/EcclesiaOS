import { expect, test } from "@playwright/test";

const loginAsAdmin = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/");
  await page.getByLabel("Email").fill("admin@ecclesiaos.local");
  await page.getByLabel("Senha").fill("admin123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
  await expect(page.getByLabel("Usuario atual").getByText("Administrador EcclesiaOS")).toBeVisible();
};

test("admin can log in and navigate core authenticated sections", async ({ page }) => {
  await loginAsAdmin(page);

  const sections = [
    { nav: "Inicio", heading: "EcclesiaOS" },
    { nav: "Igreja", heading: "Cadastro da igreja" },
    { nav: "Pessoas", heading: "Cadastro de pessoas" },
    { nav: "Grupos", heading: "Organizacao da igreja" },
    { nav: "Presenca", heading: "Registros de frequencia" },
    { nav: "Escalas", heading: "Planos de servico" },
    { nav: "Financeiro", heading: "Receitas e despesas" }
  ];

  for (const section of sections) {
    await page.getByRole("button", { name: section.nav }).click();
    await expect(page.getByRole("heading", { name: section.heading })).toBeVisible();
  }
});

test("finance screen exposes filters, summaries and receipt preview", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Financeiro" }).click();

  const filters = page.locator(".filter-bar");
  await expect(filters.getByLabel("Inicio")).toBeVisible();
  await expect(filters.getByLabel("Fim")).toBeVisible();
  await expect(filters.getByLabel("Tipo")).toBeVisible();
  await expect(page.getByText("Resumo por fundo")).toBeVisible();
  await expect(page.getByText("Resumo por categoria")).toBeVisible();

  await page.getByRole("button", { name: /2026-/ }).first().click();
  await expect(page.getByLabel("Recibo financeiro")).toBeVisible();
  await expect(page.getByText("Recibo")).toBeVisible();
});
