import React from "react";
import type { Block } from "../types";
import { cleanBlockForExport, mapUserResponseToFormState } from "../helpers";
import { Button } from "../../../assets/Main.styled";

interface Props {
  block: Block;
  setBlock: React.Dispatch<React.SetStateAction<Block>>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMultiSelectValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setUserResponseJSON: React.Dispatch<React.SetStateAction<any>>;
  userResponseJSON: any;
}

const FileOperations: React.FC<Props> = ({
  block,
  setBlock,
  setSelectedOptions,
  setCheckedOptions,
  setFieldValues,
  setMultiSelectValues,
  setIsSubmitted,
  setClearedFields,
  setUserResponseJSON,
  userResponseJSON,
}) => {
  const resetFormState = () => {
    setIsSubmitted(false);
    setClearedFields({});
    setSelectedOptions({});
    setCheckedOptions({});
    setFieldValues({});
    setMultiSelectValues({});
    setUserResponseJSON({});
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
        
        if (jsonData && jsonData.field && jsonData.field.id) {
          resetFormState();
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
        
        const mappedState = mapUserResponseToFormState(block, userResponseData);
        
        setSelectedOptions(mappedState.selectedOptions);
        setCheckedOptions(mappedState.checkedOptions);
        setFieldValues(mappedState.fieldValues);
        setMultiSelectValues(mappedState.multiSelectValues);
        
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
      {/* Form Configuration Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button 
          onClick={handleLoadFromFile} 
          style={{ 
            background: '#e8f5e8', 
            borderColor: '#4caf50', 
            color: '#2e7d32', 
            fontSize: '12px', 
            padding: '4px 8px' 
          }}
        >
          Load Form JSON
        </Button>
        <Button 
          onClick={handleExportJSON} 
          style={{ 
            background: '#e3f2fd', 
            borderColor: '#2196f3', 
            color: '#1976d2', 
            fontSize: '12px', 
            padding: '4px 8px' 
          }}
        >
          Export Form JSON
        </Button>
      </div>
      
      {/* User Response Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button 
          onClick={handleLoadUserResponse} 
          style={{ 
            background: '#fff3e0', 
            borderColor: '#ff9800', 
            color: '#f57c00', 
            fontSize: '12px', 
            padding: '4px 8px' 
          }}
        >
          Load User Response
        </Button>
        <Button 
          onClick={handleExportUserResponse} 
          style={{ 
            background: '#fce4ec', 
            borderColor: '#e91e63', 
            color: '#c2185b', 
            fontSize: '12px', 
            padding: '4px 8px' 
          }}
        >
          Export User Response
        </Button>
      </div>
    </div>
  );
};

export default FileOperations;