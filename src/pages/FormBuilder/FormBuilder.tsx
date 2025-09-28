import React, { useState, useEffect } from "react";
import type { Block } from "./types";
import { idGenerator, generateKeyFromLabel, cleanBlockForExport, generateUserResponseJSON } from "./helpers";
import FieldEditor from "./FieldEditor";
import PreviewRenderer from "./PreviewRenderer";
import FileOperations from "./components/FileOperations";
import { Container, BuilderPanel, PreviewPanel, SectionTitle, Button } from "../../assets/Main.styled";

const FormBuilder: React.FC = () => {
  const [block, setBlock] = useState<Block>({
    id: idGenerator(),
    separateBlock: false,
    displayOrdering: false,
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
  const [multiSelectValues, setMultiSelectValues] = useState<Record<string, string[]>>({});
  const [clearedFields, setClearedFields] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userResponseJSON, setUserResponseJSON] = useState<any>({});

  // Update user response JSON whenever form state changes
  useEffect(() => {
    const response = generateUserResponseJSON(
      block,
      selectedOptions,
      checkedOptions,
      fieldValues,
      multiSelectValues
    );
    setUserResponseJSON(response);
  }, [block, selectedOptions, checkedOptions, fieldValues, multiSelectValues]);

  // Initialize selected option for top-level radio
  useEffect(() => {
    const options = block.field.options || [];
    if (block.field.type === "radio" && !selectedOptions[block.field.id] && options.length) {
      setSelectedOptions((prev) => ({ ...prev, [block.field.id]: options[0].id }));
    }
  }, [block, selectedOptions]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setClearedFields({});
    
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
    setIsSubmitted(false);
    setClearedFields({});
    setSelectedOptions({});
    setCheckedOptions({});
    setFieldValues({});
    setMultiSelectValues({});
    setUserResponseJSON({});
  };

  return (
    <Container>
      <BuilderPanel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <SectionTitle style={{ margin: 0 }}>Form Builder</SectionTitle>
          <FileOperations
            block={block}
            setBlock={setBlock}
            setSelectedOptions={setSelectedOptions}
            setCheckedOptions={setCheckedOptions}
            setFieldValues={setFieldValues}
            setMultiSelectValues={setMultiSelectValues}
            setIsSubmitted={setIsSubmitted}
            setClearedFields={setClearedFields}
            setUserResponseJSON={setUserResponseJSON}
            userResponseJSON={userResponseJSON}
          />
        </div>

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
          multiSelectValues={multiSelectValues}
          setSelectedOptions={setSelectedOptions}
          setCheckedOptions={setCheckedOptions}
          setFieldValues={setFieldValues}
          setClearedFields={setClearedFields}
          setMultiSelectValues={setMultiSelectValues}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button onClick={handleReset} style={{ background: '#f0f0f0' }}>Reset</Button>
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