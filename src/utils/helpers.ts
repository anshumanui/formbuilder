import type { Block, Field } from "../types";
import { FORM_CONFIG } from "./config";

export const idGenerator = () => Math.random().toString(36).slice(2, 10);

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

    if (typeof field.order === "number") cleaned.order = field.order;
    if (field.optionsPlacement) cleaned.optionsPlacement = field.optionsPlacement;
    if (field.mandatory) cleaned.mandatory = true;
    if (field.errorMessage) cleaned.errorMessage = field.errorMessage;
    if (field.placeholder) cleaned.placeholder = field.placeholder;
    if (field.maxChars) cleaned.maxChars = field.maxChars;
    if (field.icon) cleaned.icon = field.icon;
    if (field.iconAlignment) cleaned.iconAlignment = field.iconAlignment;
    if (typeof field.decimalPoints === "number") cleaned.decimalPoints = field.decimalPoints;
    if (field.maxSelections) cleaned.maxSelections = field.maxSelections;
    if (field.blockElement) cleaned.blockElement = field.blockElement;
    if (field.separateBlock) cleaned.separateBlock = field.separateBlock;

    if (field.options && field.options.length > 0) {
      cleaned.options = field.options
        .map((opt) => {
          const optCleaned: any = { 
            id: opt.id, 
            label: opt.label,
            key: opt.key 
          };
          if (opt.helperText) optCleaned.helperText = opt.helperText;
          if (opt.placement) optCleaned.placement = opt.placement;

          if (opt.children && opt.children.length > 0) {
            const cleanedChildren = opt.children
              .map(cleanField)
              .filter((c) => c !== null);
            if (cleanedChildren.length > 0) optCleaned.children = cleanedChildren;
          }
          return optCleaned;
        })
        .filter((o) => o.label);
    }
    return cleaned;
  };

  const exportBlock: any = {
    id: block.id,
    separateBlock: block.separateBlock || false,
    displayOrdering: block.displayOrdering || false,
    field: cleanField(block.field),
  };
  
  // Add blockLabel only if it exists
  if (block.blockLabel) {
    exportBlock.blockLabel = block.blockLabel;
  }
  
  return exportBlock;
};

export const getErrorForField = (
  field: Field,
  parentSelected: boolean,
  isSubmitted: boolean,
  fieldValues: Record<string, string>,
  clearedFields: Record<string, boolean>,
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>,
  multiSelectValues?: Record<string, string[]>
): string | null => {
  if (!FORM_CONFIG.showValidationErrors || !parentSelected || !isSubmitted || !field.mandatory) {
    return null;
  }

  if (clearedFields[field.id]) return null;

  switch (field.type) {
    case "radio":
      return !selectedOptions[field.id] ? (field.errorMessage || "This field is required") : null;
      
    case "checkbox":
      const hasCheckedOption = (field.options || []).some(opt => checkedOptions[opt.id]);
      return !hasCheckedOption ? (field.errorMessage || "Please select at least one option") : null;
      
    case "select":
      const selectValue = fieldValues[field.id];
      return (!selectValue || selectValue === "") ? (field.errorMessage || "Please select an option") : null;

    case "multiselect":
      const multiSelectSelected = multiSelectValues?.[field.id] || [];
      return multiSelectSelected.length === 0 ? (field.errorMessage || "Please select at least one option") : null;
      
    case "text":
    case "textarea":
    case "numeric":
      const textValue = fieldValues[field.id];
      return (!textValue || textValue.trim() === "") ? (field.errorMessage || "This field is required") : null;
      
    default:
      const defaultValue = fieldValues[field.id];
      return !defaultValue ? (field.errorMessage || "This field is required") : null;
  }
};

// UPDATED: Generate user response JSON with ALL fields and options
export const generateUserResponseJSON = (
  block: Block,
  selectedOptions: Record<string, string>,
  checkedOptions: Record<string, boolean>,
  fieldValues: Record<string, string>,
  multiSelectValues: Record<string, string[]>
): any => {
  
  const buildFieldResponse = (field: Field): any => {
    const response: any = {};
    
    if (field.type === "radio") {
      const selectedOptionId = selectedOptions[field.id];
      
      // Include ALL options with selected: true/false
      field.options?.forEach(option => {
        const isSelected = option.id === selectedOptionId;
        response[option.key] = { selected: isSelected };
        
        // Process children for selected option
        if (option.children && option.children.length > 0) {
          option.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(response[option.key], childResponse);
            }
          });
        }
      });
    }
    
    else if (field.type === "checkbox") {
      const checkboxResponse: any = {};
      
      // Include ALL options with selected: true/false
      field.options?.forEach(option => {
        const isChecked = checkedOptions[option.id] || false;
        checkboxResponse[option.key] = { selected: isChecked };
        
        // Process children for checked option
        if (option.children && option.children.length > 0) {
          option.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(checkboxResponse[option.key], childResponse);
            }
          });
        }
      });
      
      if (Object.keys(checkboxResponse).length > 0) {
        response[field.key] = checkboxResponse;
      }
    }
    
    else if (field.type === "select") {
      const selectedValue = fieldValues[field.id];
      
      // Include ALL options with selected: true/false
      field.options?.forEach(option => {
        const isSelected = option.key === selectedValue;
        response[option.key] = { selected: isSelected };
        
        // Process children for selected option
        if (option.children && option.children.length > 0) {
          option.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(response[option.key], childResponse);
            }
          });
        }
      });
    }

    else if (field.type === "multiselect") {
      const selectedValues = multiSelectValues[field.id] || [];
      const multiselectResponse: any = {};
      
      // Include ALL options with selected: true/false
      field.options?.forEach(option => {
        const isSelected = selectedValues.includes(option.key);
        multiselectResponse[option.key] = { selected: isSelected };
        
        // Process children for selected option
        if (option.children && option.children.length > 0) {
          option.children.forEach(child => {
            const childResponse = buildFieldResponse(child);
            if (Object.keys(childResponse).length > 0) {
              Object.assign(multiselectResponse[option.key], childResponse);
            }
          });
        }
      });
      
      if (Object.keys(multiselectResponse).length > 0) {
        response[field.key] = multiselectResponse;
      }
    }
    
    // UPDATED: Input fields - show key with value or empty string
    else if (field.type === "text" || field.type === "textarea" || field.type === "numeric") {
      const value = fieldValues[field.id];
      response[field.key] = value && value.trim() !== "" ? value : "";
    }
    
    return response;
  };
  
  const rootResponse = buildFieldResponse(block.field);
  
  return {
    [block.field.key]: rootResponse
  };
};

export const mapUserResponseToFormState = (
  block: Block,
  userResponse: any
): {
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
  multiSelectValues: Record<string, string[]>;
} => {
  const selectedOptions: Record<string, string> = {};
  const checkedOptions: Record<string, boolean> = {};
  const fieldValues: Record<string, string> = {};
  const multiSelectValues: Record<string, string[]> = {};

  const processFieldResponse = (field: Field, response: any) => {
    if (!response) return;

    if (field.type === "radio") {
      field.options?.forEach(option => {
        const optionResponse = response[option.key];
        if (optionResponse && optionResponse.selected) {
          selectedOptions[field.id] = option.id;
          
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
      field.options?.forEach(option => {
        const optionResponse = response[option.key];
        if (optionResponse && optionResponse.selected) {
          fieldValues[field.id] = option.key;
          
          if (option.children) {
            option.children.forEach(child => {
              processFieldResponse(child, optionResponse);
            });
          }
        }
      });
    }

    else if (field.type === "multiselect") {
      const multiselectResponse = response[field.key];
      if (multiselectResponse) {
        const selectedKeys: string[] = [];
        
        field.options?.forEach(option => {
          const optionResponse = multiselectResponse[option.key];
          if (optionResponse && optionResponse.selected) {
            selectedKeys.push(option.key);
            
            if (option.children) {
              option.children.forEach(child => {
                processFieldResponse(child, optionResponse);
              });
            }
          }
        });
        
        if (selectedKeys.length > 0) {
          multiSelectValues[field.id] = selectedKeys;
        }
      }
    }
    
    else if (field.type === "text" || field.type === "textarea" || field.type === "numeric") {
      const value = response[field.key];
      if (value && typeof value === "string") {
        fieldValues[field.id] = value;
      }
    }
  };

  const rootResponse = userResponse[block.field.key];
  if (rootResponse) {
    processFieldResponse(block.field, rootResponse);
  }

  return {
    selectedOptions,
    checkedOptions,
    fieldValues,
    multiSelectValues
  };
};