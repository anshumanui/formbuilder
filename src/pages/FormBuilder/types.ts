export type FieldType = "radio" | "text" | "checkbox" | "textarea" | "select" | "numeric" | "multiselect";

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
  maxSelections?: number; // Optional limit on number of selections for multiselect
  blockElement?: boolean; // New property to make field take full width
}

export interface Option {
  id: string;
  label: string;
  key: string; 
  helperText?: string;
  children?: Field[];
  placement?: "row" | "column";
}

export interface Block {
  id: string;
  field: Field;
  separateBlock?: boolean;
}