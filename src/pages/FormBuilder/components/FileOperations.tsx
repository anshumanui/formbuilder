import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../store";
import { 
  setBlock, 
  setSelectedOption, 
  resetForm, 
  setAllFormStates 
} from "../../../store/slices/formSlice";
import { cleanBlockForExport, mapUserResponseToFormState } from "../../../utils/helpers";
import { 
  FileOperationsContainer,
  FileOperationsRow,
  FileButton
} from "../../../assets/Components.styled";

const FileOperations: React.FC = () => {
  const dispatch = useDispatch();
  const { block, userResponseJSON } = useSelector((state: RootState) => state.form);

  const resetFormState = () => {
    dispatch(resetForm());
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
          dispatch(setBlock(jsonData));
          
          // Initialize radio selections if needed
          if (jsonData.field.type === "radio" && jsonData.field.options?.length > 0) {
            dispatch(setSelectedOption({ 
              fieldId: jsonData.field.id, 
              optionId: jsonData.field.options[0].id 
            }));
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
        
        dispatch(setAllFormStates({
          selectedOptions: mappedState.selectedOptions,
          checkedOptions: mappedState.checkedOptions,
          fieldValues: mappedState.fieldValues,
          multiSelectValues: mappedState.multiSelectValues
        }));
        
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
    <FileOperationsContainer>
      {/* Form Configuration Buttons */}
      <FileOperationsRow>
        <FileButton 
          $variant="load"
          onClick={handleLoadFromFile}
        >
          Load Form JSON
        </FileButton>
        <FileButton 
          $variant="export"
          onClick={handleExportJSON}
        >
          Export Form JSON
        </FileButton>
      </FileOperationsRow>
      
      {/* User Response Buttons */}
      <FileOperationsRow>
        <FileButton 
          $variant="userLoad"
          onClick={handleLoadUserResponse}
        >
          Load User Response
        </FileButton>
        <FileButton 
          $variant="userExport"
          onClick={handleExportUserResponse}
        >
          Export User Response
        </FileButton>
      </FileOperationsRow>
    </FileOperationsContainer>
  );
};

export default FileOperations;