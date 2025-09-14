// utils/index.ts
import type { Block, Field } from "../features/types";

// --- ID Generator ---
export const generateId = (): string => Math.random().toString(36).slice(2, 10);

// --- Key from Label ---
export const generateKeyFromLabel = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("_");
};

// --- Create Empty Field ---
export const createEmptyField = (): Field => ({
  id: generateId(),
  type: "text",
  label: "",
  key: "",
  value: "",
});

// --- Clean Block for Export ---
export const cleanBlockForExport = (block: Block): any => {
  const cleanField = (field: Field): any => {
    const cleaned: any = {
      id: field.id,
      type: field.type,
      label: field.label,
      key: field.key,
    };

    if (field.mandatory) cleaned.mandatory = true;
    if (field.errorMessage) cleaned.errorMessage = field.errorMessage;
    if (field.placeholder) cleaned.placeholder = field.placeholder;
    if (field.maxChars) cleaned.maxChars = field.maxChars;
    if (field.icon) cleaned.icon = field.icon;
    if (field.iconAlignment) cleaned.iconAlignment = field.iconAlignment;
    if (typeof field.decimalPoints === "number") cleaned.decimalPoints = field.decimalPoints;

    if (field.options && field.options.length > 0) {
      cleaned.options = field.options
        .map((opt) => {
          const optCleaned: any = { id: opt.id, value: opt.value };
          if (opt.helperText) optCleaned.helperText = opt.helperText;
          if (opt.children && opt.children.length > 0) {
            const cleanedChildren = opt.children.map(cleanField).filter(c => c !== null);
            if (cleanedChildren.length > 0) optCleaned.children = cleanedChildren;
          }
          return optCleaned;
        })
        .filter(o => o.value); // remove empty options
    }

    return cleaned;
  };

  return {
    id: block.id,
    blockTitle: block.blockTitle,
    separateBlock: block.separateBlock || false,
    field: cleanField(block.field),
  };
};
