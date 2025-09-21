import type { Block, Field } from "./types";

export const idGenerator = () => Math.random().toString(36).slice(2, 10);

export const createEmptyField = (): Field => ({
  id: idGenerator(),
  type: "text",
  label: "",
  key: "",
  value: "",
  separateBlock: false
});

export const generateKeyFromLabel = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("_");
};

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
            const cleanedChildren = opt.children
              .map(cleanField)
              .filter((c) => c !== null);
            if (cleanedChildren.length > 0) optCleaned.children = cleanedChildren;
          }
          return optCleaned;
        })
        .filter((o) => o.value);
    }
    return cleaned;
  };

  return {
    id: block.id,
    separateBlock: block.separateBlock || false,
    field: cleanField(block.field),
  };
};

// Validation helpers
export const shouldValidateField = (field: Field, parentSelected: boolean): boolean =>
  parentSelected && field.mandatory === true;

export const getErrorForField = (
  field: Field,
  parentSelected: boolean,
  isSubmitted: boolean,
  fieldValues: Record<string, string>,
  clearedFields: Record<string, boolean>,
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>
): string | null => {
  if (!parentSelected) return null;

  if (!isSubmitted) return null;

  if (field.mandatory) {
    switch (field.type) {
      case "radio":
        if (!selectedOptions[field.id]) return "This field is required";
        break;
      case "checkbox":
        const hasChecked = (field.options || []).some(
          (opt) => checkedOptions[opt.id]
        );
        if (!hasChecked) return "This field is required";
        break;
      default:
        if (!fieldValues[field.id]) return "This field is required";
    }
  }

  return null;
};

