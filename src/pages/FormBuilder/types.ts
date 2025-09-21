export type FieldType = "radio" | "text" | "checkbox" | "textarea" | "select" | "numeric";

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
