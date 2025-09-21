import type { Block, Field } from "./types";
import { FORM_CONFIG } from "./config";

export const idGenerator = () => Math.random().toString(36).slice(2, 10);

export const createEmptyField = (): Field => ({
  id: idGenerator(),
  type: "text",
  label: "",
  key: "",
  value: ""
});

export const generateKeyFromLabel = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("_");
};

export const cleanBlockForExport = (block: Block): any => {
  const cleanField = (field: Field): any => {
    const cleaned: any = {
      id: field.id,
      type: field.type,
      label: field.label,
      key: field.key,
    };

    if (field.mandatory) cleaned.mandatory = true;
    if (field.errorMessage) cleaned.errorMessage = field.errorMessage;
    if (field.placeholder) cleaned.placeholder = field.placeholder;
    if (field.maxChars) cleaned.maxChars = field.maxChars;
    if (field.icon) cleaned.icon = field.icon;
    if (field.iconAlignment) cleaned.iconAlignment = field.iconAlignment;
    if (typeof field.decimalPoints === "number") cleaned.decimalPoints = field.decimalPoints;

    if (field.options && field.options.length > 0) {
      cleaned.options = field.options
        .map((opt) => {
          const optCleaned: any = { 
            id: opt.id, 
            label: opt.label,
            key: opt.key 
          };
          if (opt.helperText) optCleaned.helperText = opt.helperText;

          if (opt.children && opt.children.length > 0) {
            const cleanedChildren = opt.children
              .map(cleanField)
              .filter((c) => c !== null);
            if (cleanedChildren.length > 0) optCleaned.children = cleanedChildren;
          }
          return optCleaned;
        })
        .filter((o) => o.label); // Filter by label instead of value
    }
    return cleaned;
  };

  return {
    id: block.id,
    separateBlock: block.separateBlock || false,
    field: cleanField(block.field),
  };
};

// Check if a field should be validated based on parent selection
export const isFieldActive = (
  field: Field,
  parentPath: string[] = [],
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>,
  fieldValues: Record<string, string>
): boolean => {
  // If no parent path, this is a top-level field
  if (parentPath.length === 0) return true;
  
  // Check each parent in the path
  for (let i = 0; i < parentPath.length; i += 2) {
    const parentFieldId = parentPath[i];
    const parentOptionId = parentPath[i + 1];
    
    // Find the parent field type - this would need to be passed or tracked
    // For now, check all possible selection types
    const isRadioSelected = selectedOptions[parentFieldId] === parentOptionId;
    const isCheckboxChecked = checkedOptions[parentOptionId];
    const isSelectSelected = fieldValues[parentFieldId] && 
      // We'd need to map values to option IDs for select fields
      true; // Simplified for now
    
    if (!isRadioSelected && !isCheckboxChecked && !isSelectSelected) {
      return false;
    }
  }
  
  return true;
};

// Validation helpers
export const shouldValidateField = (field: Field, parentSelected: boolean): boolean =>
  parentSelected && field.mandatory === true;

export const getErrorForField = (
  field: Field,
  parentSelected: boolean,
  isSubmitted: boolean,
  fieldValues: Record<string, string>,
  clearedFields: Record<string, boolean>,
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>
): string | null => {
  // Don't show errors if global config disables validation errors
  if (!FORM_CONFIG.showValidationErrors) return null;

  // Don't show errors if parent is not selected
  if (!parentSelected) return null;

  // Don't show errors if form hasn't been submitted
  if (!isSubmitted) return null;

  // Don't show errors if field is not mandatory
  if (!field.mandatory) return null;

  // Check if field has been interacted with and cleared error
  if (clearedFields[field.id]) return null;

  // Validate based on field type
  switch (field.type) {
    case "radio":
      if (!selectedOptions[field.id]) {
        return field.errorMessage || "This field is required";
      }
      break;
      
    case "checkbox":
      const hasCheckedOption = (field.options || []).some(
        (opt) => checkedOptions[opt.id]
      );
      if (!hasCheckedOption) {
        return field.errorMessage || "Please select at least one option";
      }
      break;
      
    case "select":
      const selectValue = fieldValues[field.id];
      if (!selectValue || selectValue === "") {
        return field.errorMessage || "Please select an option";
      }
      break;
      
    case "text":
    case "textarea":
    case "numeric":
      const textValue = fieldValues[field.id];
      if (!textValue || textValue.trim() === "") {
        return field.errorMessage || "This field is required";
      }
      break;
      
    default:
      const defaultValue = fieldValues[field.id];
      if (!defaultValue) {
        return field.errorMessage || "This field is required";
      }
  }

  return null;
};

// Collect all fields recursively with their parent context
export const collectAllFields = (
  field: Field,
  parentPath: string[] = []
): Array<{ field: Field; parentPath: string[] }> => {
  const result: Array<{ field: Field; parentPath: string[] }> = [];
  
  // Add current field
  result.push({ field, parentPath });
  
  // Add children
  if (field.options) {
    field.options.forEach(option => {
      if (option.children) {
        option.children.forEach(child => {
          const childPath = [...parentPath, field.id, option.id];
          result.push(...collectAllFields(child, childPath));
        });
      }
    });
  }
  
  return result;
};

// Generate user response JSON mapped to keys
export const generateUserResponseJSON = (
  block: Block,
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>,
  fieldValues: Record<string, string>
): any => {
  
  const buildFieldResponse = (field: Field): any => {
    const response: any = {};
    
    if (field.type === "radio") {
      const selectedOptionId = selectedOptions[field.id];
      const selectedOption = field.options?.find(opt => opt.id === selectedOptionId);
      
      if (selectedOption) {
        response[selectedOption.key] = {
          selected: true
        };
        
        // Add children responses if any
        if (selectedOption.children && selectedOption.children.length > 0) {
          selectedOption.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(response[selectedOption.key], childResponse);
            }
          });
        }
      }
    }
    
    else if (field.type === "checkbox") {
      const checkboxResponse: any = {};
      
      field.options?.forEach(option => {
        const isChecked = checkedOptions[option.id];
        if (isChecked) {
          checkboxResponse[option.key] = {
            selected: true
          };
          
          // Add children responses if any
          if (option.children && option.children.length > 0) {
            option.children.forEach(child => {
              const childResponse = buildFieldResponse(child);
              if (Object.keys(childResponse).length > 0) {
                Object.assign(checkboxResponse[option.key], childResponse);
              }
            });
          }
        }
      });
      
      if (Object.keys(checkboxResponse).length > 0) {
        response[field.key] = checkboxResponse;
      }
    }
    
    else if (field.type === "select") {
      const selectedValue = fieldValues[field.id];
      const selectedOption = field.options?.find(opt => opt.key === selectedValue);
      
      if (selectedOption) {
        response[selectedOption.key] = {
          selected: true
        };
        
        // Add children responses if any
        if (selectedOption.children && selectedOption.children.length > 0) {
          selectedOption.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(response[selectedOption.key], childResponse);
            }
          });
        }
      }
    }
    
    else if (field.type === "text" || field.type === "textarea" || field.type === "numeric") {
      const value = fieldValues[field.id];
      if (value && value.trim() !== "") {
        response[field.key] = value;
      }
    }
    
    return response;
  };
  
  // Start with the root field
  const rootResponse = buildFieldResponse(block.field);
  
  return {
    [block.field.key]: rootResponse
  };
};

// Map user response JSON to form state
export const mapUserResponseToFormState = (
  block: Block,
  userResponse: any
): {
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
} => {
  const selectedOptions: Record<string, string> = {};
  const checkedOptions: Record<string, boolean> = {};
  const fieldValues: Record<string, string> = {};

  const processFieldResponse = (field: Field, response: any) => {
    if (!response) return;

    if (field.type === "radio") {
      // Find which option was selected
      field.options?.forEach(option => {
        const optionResponse = response[option.key];
        if (optionResponse && optionResponse.selected) {
          selectedOptions[field.id] = option.id;
          
          // Process children if any
          if (option.children) {
            option.children.forEach(child => {
              processFieldResponse(child, optionResponse);
            });
          }
        }
      });
    }
    
    else if (field.type === "checkbox") {
      const checkboxResponse = response[field.key];
      if (checkboxResponse) {
        field.options?.forEach(option => {
          const optionResponse = checkboxResponse[option.key];
          if (optionResponse && optionResponse.selected) {
            checkedOptions[option.id] = true;
            
            // Process children if any
            if (option.children) {
              option.children.forEach(child => {
                processFieldResponse(child, optionResponse);
              });
            }
          }
        });
      }
    }
    
    else if (field.type === "select") {
      // Find which option was selected
      field.options?.forEach(option => {
        const optionResponse = response[option.key];
        if (optionResponse && optionResponse.selected) {
          fieldValues[field.id] = option.key;
          
          // Process children if any
          if (option.children) {
            option.children.forEach(child => {
              processFieldResponse(child, optionResponse);
            });
          }
        }
      });
    }
    
    else if (field.type === "text" || field.type === "textarea" || field.type === "numeric") {
      const value = response[field.key];
      if (value && typeof value === "string") {
        fieldValues[field.id] = value;
      }
    }
  };

  // Start processing from the root field
  const rootResponse = userResponse[block.field.key];
  if (rootResponse) {
    processFieldResponse(block.field, rootResponse);
  }

  return {
    selectedOptions,
    checkedOptions,
    fieldValues
  };
};