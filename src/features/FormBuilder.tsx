import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../app/store";
import { setBlock } from "../features/formSlice";
import FieldEditor from "../components/FieldEditor";
import {
  Container,
  BuilderPanel,
  PreviewPanel,
  SectionTitle,
  InputLabel,
  TextInput,
} from "../assets/Main.styled";
import type { Field } from "../features/types";

const FormBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const block = useSelector((state: RootState) => state.form.block);

  // Update a field inside the block
  const handleFieldChange = (updatedField: Field) => {
    dispatch(setBlock({ ...block, field: updatedField }));
  };

  // Update block title
  const handleTitleChange = (title: string) => {
    dispatch(setBlock({ ...block, blockTitle: title }));
  };

  return (
    <Container>
      <BuilderPanel>
        <SectionTitle>Form Builder</SectionTitle>

        <InputLabel>Block Title</InputLabel>
        <TextInput
          value={block.blockTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
        />

        <FieldEditor
          field={block.field}
          level={0}
          block={block}
          onChange={handleFieldChange}
        />
      </BuilderPanel>

      <PreviewPanel>
        <SectionTitle>{block.blockTitle}</SectionTitle>
        <pre>{JSON.stringify(block, null, 2)}</pre>
      </PreviewPanel>
    </Container>
  );
};

export default FormBuilder;
