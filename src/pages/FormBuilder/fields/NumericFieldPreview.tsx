import React from "react";
import type { Field, Block } from "../types";
import { ErrorHelper, FlexRow, SmallIcon } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  fieldValues: Record<string, string>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  error?: string | null;
}

const NumericFieldPreview: React.FC<Props> = ({
  field,
  block: _block,
  fieldValues,
  setFieldValues,
  setClearedFields,
  error,
}) => {
  const value = fieldValues[field.id] || "";
  const dp = field.decimalPoints ?? 0;

  const regexMap: Record<number, RegExp> = {
    0: /^\d*$/,
    1: /^\d*(\.\d{0,1})?$/,
    2: /^\d*(\.\d{0,2})?$/,
  };

  return (
    <FlexRow>
      {field.icon && field.iconAlignment === "left" && <SmallIcon>{field.icon}</SmallIcon>}
      <input
        inputMode="decimal"
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (regexMap[dp].test(newValue)) {
            setFieldValues((prev) => ({ ...prev, [field.id]: newValue }));
            setClearedFields((prev) => ({ ...prev, [field.id]: true }));
          }
        }}
      />
      {field.icon && field.iconAlignment === "right" && <SmallIcon>{field.icon}</SmallIcon>}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </FlexRow>
  );
};

export default NumericFieldPreview;