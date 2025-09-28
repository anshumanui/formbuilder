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

const TextFieldPreview: React.FC<Props> = ({ field, error }) => {
  const dispatch = useDispatch();
  const { fieldValues } = useSelector((state: RootState) => state.form);

  return (
    <FlexRow>
      {field.icon && field.iconAlignment === "left" && <SmallIcon>{field.icon}</SmallIcon>}
      <input
        placeholder={field.placeholder}
        maxLength={field.maxChars}
        value={fieldValues[field.id] || ""}
        onChange={(e) => {
          dispatch(setFieldValue({ fieldId: field.id, value: e.target.value }));
          dispatch(setClearedField({ fieldId: field.id }));
        }}
      />
      {field.icon && field.iconAlignment === "right" && <SmallIcon>{field.icon}</SmallIcon>}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </FlexRow>
  );
};

export default TextFieldPreview;