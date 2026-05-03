import type { LabelTemplate } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultLabelTemplates: LabelTemplate[] = [
  {
    id: "lbl_kids_dk1202",
    name: "Kids - Brother DK-1202 62x100mm",
    printerModel: "Brother DK-1202",
    widthMm: 62,
    heightMm: 100,
    isContinuous: false,
    layout: "kids_checkin",
    isDefault: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "lbl_kids_continuous",
    name: "Kids - Brother 62mm continuo",
    printerModel: "Brother QL serie",
    widthMm: 62,
    heightMm: 0,
    isContinuous: true,
    layout: "kids_checkin",
    isDefault: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "lbl_visitor_default",
    name: "Visitante - 62x100mm",
    printerModel: "Brother DK-1202",
    widthMm: 62,
    heightMm: 100,
    isContinuous: false,
    layout: "visitor",
    isDefault: true,
    createdAt: now,
    updatedAt: now
  }
];
