import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../store";
import { 
  setBlock, 
  setSelectedOption, 
  setIsSubmitted, 
  resetForm, 
  setUserResponseJSON 
} from "../../store/slices/formSlice";
import { cleanBlockForExport, generateUserResponseJSON } from "../../utils/helpers";
import FieldEditor from "./components/FieldEditor";
import PreviewRenderer from "./components/PreviewRenderer";
import FileOperations from "./components/FileOperations";
import { 
  Container, 
  BuilderPanel, 
  PreviewPanel, 
  SectionTitle, 
  FormButtonContainer,
  SubmitButton,
  ResetButton,
  JsonDisplay,
  FormHeaderContainer
} from "../../assets/Components.styled";

const FormBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const {
    block,
    selectedOptions,
    checkedOptions,
    fieldValues,
    multiSelectValues,
    userResponseJSON
  } = useSelector((state: RootState) => state.form);

  // Update user response JSON whenever form state changes
  useEffect(() => {
    const response = generateUserResponseJSON(
      block,
      selectedOptions,
      checkedOptions,
      fieldValues,
      multiSelectValues
    );
    dispatch(setUserResponseJSON(response));
  }, [block, selectedOptions, checkedOptions, fieldValues, multiSelectValues, dispatch]);

  // Initialize selected option for top-level radio
  useEffect(() => {
    const options = block.field.options || [];
    if (block.field.type === "radio" && !selectedOptions[block.field.id] && options.length) {
      dispatch(setSelectedOption({ fieldId: block.field.id, optionId: options[0].id }));
    }
  }, [block, selectedOptions, dispatch]);

  const handleSubmit = () => {
    dispatch(setIsSubmitted(true));
    
    const userResponse = generateUserResponseJSON(
      block,
      selectedOptions,
      checkedOptions,
      fieldValues,
      multiSelectValues
    );
    
    console.log("User Response JSON:", userResponse);
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const handleFieldChange = (updatedField: any) => {
    dispatch(setBlock({ ...block, field: updatedField }));
  };

  return (
    <Container>
      <BuilderPanel>
        <FormHeaderContainer>
          <SectionTitle $margin="0">Form Builder</SectionTitle>
          <FileOperations />
        </FormHeaderContainer>

        <FieldEditor
          field={block.field}
          onChange={handleFieldChange}
          level={0}
          block={block}
        />
      </BuilderPanel>

      <PreviewPanel>
        <PreviewRenderer
          field={block.field}
          block={block}
          level={0}
          parentSelected={true}
        />

        <FormButtonContainer>
          <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
          <ResetButton onClick={handleReset}>Reset</ResetButton>
        </FormButtonContainer>

        <SectionTitle>Form Structure JSON</SectionTitle>
        <JsonDisplay>
          {JSON.stringify(cleanBlockForExport(block), null, 2)}
        </JsonDisplay>

        <SectionTitle>User Response JSON</SectionTitle>
        <JsonDisplay>
          {JSON.stringify(userResponseJSON, null, 2)}
        </JsonDisplay>
      </PreviewPanel>
    </Container>
  );
};

export default FormBuilder;