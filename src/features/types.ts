// features/types.ts

// Allowed field types
export type FieldType = "radio" | "text" | "checkbox" | "textarea" | "select" | "numeric";

// Option for fields like radio, checkbox, select
export interface Option {
  id: string;
  value: string;
  helperText?: string;
  children?: Field[];
  placement?: "row" | "column";
}

// Individual field
export interface Field {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  value: string;
  mandatory?: boolean;
  errorMessage?: string;
  placeholder?: string;
  maxChars?: number;
  icon?: string;
  iconAlignment?: "left" | "right";
  options?: Option[];
  decimalPoints?: 0 | 1 | 2;
}

// Form block containing one top-level field
export interface Block {
  id: string;
  blockTitle: string;
  separateBlock?: boolean;
  field: Field;
}
