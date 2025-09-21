import React, { useState, useEffect } from "react";
import type { Block } from "./types";
import { idGenerator, generateKeyFromLabel, cleanBlockForExport, generateUserResponseJSON } from "./helpers";
import FieldEditor from "./FieldEditor";
import PreviewRenderer from "./PreviewRenderer";
import { Container, BuilderPanel, PreviewPanel, SectionTitle, Button } from "../../assets/Main.styled";

const FormBuilder: React.FC = () => {
  const [block, setBlock] = useState<Block>({
    id: idGenerator(),
    separateBlock: false, // ✅ top-level separate block
    field: {
      id: idGenerator(),
      type: "radio",
      label: "Choose an option",
      key: generateKeyFromLabel("Choose an option"),
      value: "",
      options: [
        { id: idGenerator(), label: "Option 1", key: "option_1", helperText: "", children: [] },
        { id: idGenerator(), label: "Option 2", key: "option_2", helperText: "", children: [] },
      ],
    },
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [clearedFields, setClearedFields] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userResponseJSON, setUserResponseJSON] = useState<any>({});

  // Update user response JSON whenever form state changes
  useEffect(() => {
    const response = generateUserResponseJSON(
      block,
      selectedOptions,
      checkedOptions,
      fieldValues
    );
    setUserResponseJSON(response);
  }, [block, selectedOptions, checkedOptions, fieldValues]);

  // Initialize selected option for top-level radio
  useEffect(() => {
    const options = block.field.options || [];
    if (block.field.type === "radio" && !selectedOptions[block.field.id] && options.length) {
      setSelectedOptions((prev) => ({ ...prev, [block.field.id]: options[0].id }));
    }
  }, [block, selectedOptions]);

  // TODO: Replace FORM_CONFIG with API call
  // useEffect(() => {
  //   // Fetch form configuration from API
  //   // fetch('/api/form-config')
  //   //   .then(response => response.json())
  //   //   .then(config => {
  //   //     // Update FORM_CONFIG.showValidationErrors = config.showValidationErrors
  //   //   });
  // }, []);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Reset cleared fields to show errors for all required fields
    setClearedFields({});
    
    // Generate user response JSON
    const userResponse = generateUserResponseJSON(
      block,
      selectedOptions,
      checkedOptions,
      fieldValues
    );
    
    console.log("User Response JSON:", userResponse);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setClearedFields({});
    setSelectedOptions({});
    setCheckedOptions({});
    setFieldValues({});
    setUserResponseJSON({});
  };

  return (
    <Container>
      <BuilderPanel>
        <SectionTitle>Form Builder</SectionTitle>
        <FieldEditor
          field={block.field}
          onChange={(updated) => setBlock({ ...block, field: updated })}
          level={0}
          block={block}
          setBlock={setBlock}
        />
      </BuilderPanel>

      <PreviewPanel>
        <PreviewRenderer
          field={block.field}
          block={block}
          isSubmitted={isSubmitted}
          selectedOptions={selectedOptions}
          checkedOptions={checkedOptions}
          fieldValues={fieldValues}
          clearedFields={clearedFields}
          setSelectedOptions={setSelectedOptions}
          setCheckedOptions={setCheckedOptions}
          setFieldValues={setFieldValues}
          setClearedFields={setClearedFields}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
          
          <Button onClick={handleReset} style={{ background: '#f0f0f0' }}>
            Reset
          </Button>
        </div>

        <SectionTitle>Form Structure JSON</SectionTitle>
        <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(cleanBlockForExport(block), null, 2)}
        </pre>

        <SectionTitle>User Response JSON</SectionTitle>
        <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(userResponseJSON, null, 2)}
        </pre>
      </PreviewPanel>
    </Container>
  );
};

export default FormBuilder;