import React, { useState, useEffect } from "react";
import type { Block } from "./types";
import { idGenerator, generateKeyFromLabel, cleanBlockForExport, generateUserResponseJSON, mapUserResponseToFormState } from "./helpers";
import { FORM_CONFIG } from "./config";
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate the JSON structure
      if (jsonData && jsonData.field && jsonData.field.id) {
        // Reset form state
        setIsSubmitted(false);
        setClearedFields({});
        setSelectedOptions({});
        setCheckedOptions({});
        setFieldValues({});
        setMultiSelectValues({});
        setUserResponseJSON({});
        
        // Load the new form structure
        setBlock(jsonData);
        
        // Initialize radio selections if needed
        if (jsonData.field.type === "radio" && jsonData.field.options?.length > 0) {
          setSelectedOptions({ [jsonData.field.id]: jsonData.field.options[0].id });
        }
        
        alert("Form loaded successfully!");
      } else {
        alert("Invalid JSON structure. Please ensure it contains a valid form configuration.");
      }
    } catch (error) {
      alert("Error reading file. Please ensure it's a valid JSON file.");
      console.error("File reading error:", error);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleLoadFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // Validate the JSON structure
        if (jsonData && jsonData.field && jsonData.field.id) {
          // Reset form state
          setIsSubmitted(false);
          setClearedFields({});
          setSelectedOptions({});
          setCheckedOptions({});
          setFieldValues({});
          setMultiSelectValues({});
          setUserResponseJSON({});
          
          // Load the new form structure
          setBlock(jsonData);
          
          // Initialize radio selections if needed
          if (jsonData.field.type === "radio" && jsonData.field.options?.length > 0) {
            setSelectedOptions({ [jsonData.field.id]: jsonData.field.options[0].id });
          }
          
          alert("Form loaded successfully!");
        } else {
          alert("Invalid JSON structure. Please ensure it contains a valid form configuration.");
        }
      } catch (error) {
        alert("Error reading file. Please ensure it's a valid JSON file.");
        console.error("File reading error:", error);
      }
    };
    input.click();
  };

  const handleExportJSON = () => {
    const jsonData = cleanBlockForExport(block);
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `form-${block.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLoadUserResponse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const userResponseData = JSON.parse(text);
        
        // Map user response to form state
        const mappedState = mapUserResponseToFormState(block, userResponseData);
        
        // Apply the mapped state to the form
        setSelectedOptions(mappedState.selectedOptions);
        setCheckedOptions(mappedState.checkedOptions);
        setFieldValues(mappedState.fieldValues);
        setMultiSelectValues(mappedState.multiSelectValues);
        
        // Clear any existing errors and submission state
        setIsSubmitted(false);
        setClearedFields({});
        
        alert("User response loaded successfully!");
      } catch (error) {
        alert("Error reading user response file. Please ensure it's a valid JSON file.");
        console.error("User response loading error:", error);
      }
    };
    input.click();
  };

  const handleExportUserResponse = () => {
    const dataStr = JSON.stringify(userResponseJSON, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user-response-${block.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Container>
      <BuilderPanel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <SectionTitle style={{ margin: 0 }}>Form Builder</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            {/* Form Configuration Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={handleLoadFromFile} style={{ background: '#e8f5e8', borderColor: '#4caf50', color: '#2e7d32', fontSize: '12px', padding: '4px 8px' }}>
                Load Form JSON
              </Button>
              <Button onClick={handleExportJSON} style={{ background: '#e3f2fd', borderColor: '#2196f3', color: '#1976d2', fontSize: '12px', padding: '4px 8px' }}>
                Export Form JSON
              </Button>
            </div>
            
            {/* User Response Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={handleLoadUserResponse} style={{ background: '#fff3e0', borderColor: '#ff9800', color: '#f57c00', fontSize: '12px', padding: '4px 8px' }}>
                Load User Response
              </Button>
              <Button onClick={handleExportUserResponse} style={{ background: '#fce4ec', borderColor: '#e91e63', color: '#c2185b', fontSize: '12px', padding: '4px 8px' }}>
                Export User Response
              </Button>
            </div>
          </div>
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