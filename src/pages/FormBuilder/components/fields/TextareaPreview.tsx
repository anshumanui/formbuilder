import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setFieldValue, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import { RelativeTextareaWrapper, CharCounter, ErrorHelper, TextareaInput } from "../../../../assets/Components.styled";

interface Props {
  field: Field;
  block: Block;
  error?: string | null;
}

const TextareaPreview: React.FC<Props> = ({ field, error }) => {
  const dispatch = useDispatch();
  const { fieldValues } = useSelector((state: RootState) => state.form);
  const value = fieldValues[field.id] || "";

  return (
    <RelativeTextareaWrapper>
      <TextareaInput
        placeholder={field.placeholder}
        maxLength={field.maxChars}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!field.maxChars || newValue.length <= field.maxChars) {
            dispatch(setFieldValue({ fieldId: field.id, value: newValue }));
            dispatch(setClearedField({ fieldId: field.id }));
          }
        }}
      />
      {field.maxChars && <CharCounter>{value.length} / {field.maxChars}</CharCounter>}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </RelativeTextareaWrapper>
  );
};

export default TextareaPreview;