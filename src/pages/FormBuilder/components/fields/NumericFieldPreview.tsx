import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setFieldValue, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import { ErrorHelper, FlexRow, SmallIcon } from "../../../../assets/Components.styled";

interface Props {
  field: Field;
  block: Block;
  error?: string | null;
}

const NumericFieldPreview: React.FC<Props> = ({ field, error }) => {
  const dispatch = useDispatch();
  const { fieldValues } = useSelector((state: RootState) => state.form);
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
            dispatch(setFieldValue({ fieldId: field.id, value: newValue }));
            dispatch(setClearedField({ fieldId: field.id }));
          }
        }}
      />
      {field.icon && field.iconAlignment === "right" && <SmallIcon>{field.icon}</SmallIcon>}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </FlexRow>
  );
};

export default NumericFieldPreview;