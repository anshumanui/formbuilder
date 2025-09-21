import React from "react";
import type { Field, Block } from "./types";
import { getErrorForField } from "./helpers";
import {
  BlockWrapper,
  FieldContainer,
  PreviewLabel,
} from "../../assets/Main.styled";

import TextFieldPreview from "./fields/TextFieldPreview";
import TextareaPreview from "./fields/TextareaPreview";
import NumericFieldPreview from "./fields/NumericFieldPreview";
import SelectPreview from "./fields/SelectPreview";
import CheckboxPreview from "./fields/CheckboxPreview";
import RadioPreview from "./fields/RadioPreview";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
  isSubmitted: boolean;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
  clearedFields: Record<string, boolean>;
  setSelectedOptions?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const PreviewRenderer: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
  isSubmitted,
  selectedOptions,
  checkedOptions,
  fieldValues,
  clearedFields,
  setSelectedOptions,
  setCheckedOptions,
  setFieldValues,
  setClearedFields,
}) => {
  const error = getErrorForField(
    field,
    parentSelected,
    isSubmitted,
    fieldValues,
    clearedFields,
    selectedOptions,
    checkedOptions
  );

  // Get children from selected options for top-level fields
  const getTopLevelChildren = () => {
    if (level !== 0) return [];
    
    if (field.type === "radio") {
      const selectedOptionId = selectedOptions[field.id];
      const selectedOption = field.options?.find(opt => opt.id === selectedOptionId);
      return selectedOption?.children || [];
    }
    
    if (field.type === "checkbox") {
      return field.options?.flatMap(opt => 
        checkedOptions[opt.id] ? (opt.children || []) : []
      ) || [];
    }
    
    if (field.type === "select") {
      const selectedValue = fieldValues[field.id];
      const selectedOption = field.options?.find(opt => opt.key === selectedValue);
      return selectedOption?.children || [];
    }
    
    return [];
  };

  const topLevelChildren = getTopLevelChildren();

  // Clear error when user interacts with field
  const clearFieldError = () => {
    if (setClearedFields) {
      setClearedFields(prev => ({ ...prev, [field.id]: true }));
    }
  };

  return (
    <>
      <BlockWrapper level={level}>
        {field.label && <PreviewLabel>{field.label}</PreviewLabel>}

        {field.type === "text" && fieldValues && setFieldValues && setClearedFields && (
          <TextFieldPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        )}

        {field.type === "textarea" && fieldValues && setFieldValues && setClearedFields && (
          <TextareaPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        )}

        {field.type === "numeric" && fieldValues && setFieldValues && setClearedFields && (
          <NumericFieldPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        )}

        {field.type === "select" && (
          <SelectPreview
            field={field}
            block={block}
            level={level}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues!}
            setClearedFields={setClearedFields!}
            isSubmitted={isSubmitted}
            selectedOptions={selectedOptions}
            checkedOptions={checkedOptions}
            clearedFields={clearedFields}
            setSelectedOptions={setSelectedOptions!}
            setCheckedOptions={setCheckedOptions!}
            error={error}
            // Pass flag to prevent rendering children in SelectPreview
            renderChildrenInParent={level === 0 && block.separateBlock}
          />
        )}

        {field.type === "checkbox" && (
          <CheckboxPreview
            field={field}
            block={block}
            level={level}
            checkedOptions={checkedOptions}
            setCheckedOptions={setCheckedOptions!}
            setClearedFields={setClearedFields!}
            isSubmitted={isSubmitted}
            selectedOptions={selectedOptions}
            fieldValues={fieldValues}
            clearedFields={clearedFields}
            setSelectedOptions={setSelectedOptions!}
            setFieldValues={setFieldValues!}
            error={error}
            // Pass flag to prevent rendering children in CheckboxPreview
            renderChildrenInParent={level === 0 && block.separateBlock}
          />
        )}

        {field.type === "radio" && (
          <RadioPreview
            field={field}
            block={block}
            level={level}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions!}
            setClearedFields={setClearedFields!}
            isSubmitted={isSubmitted}
            checkedOptions={checkedOptions}
            fieldValues={fieldValues}
            clearedFields={clearedFields}
            setCheckedOptions={setCheckedOptions!}
            setFieldValues={setFieldValues!}
            error={error}
            // Pass flag to prevent rendering children in RadioPreview
            renderChildrenInParent={level === 0 && block.separateBlock}
          />
        )}
      </BlockWrapper>

      {/* Render top-level children separately if separateBlock is true */}
      {level === 0 && block.separateBlock && topLevelChildren.length > 0 && (
        <BlockWrapper level={level + 1} separate>
          {topLevelChildren.map((child) => (
            <PreviewRenderer
              key={child.id}
              field={child}
              block={block}
              level={level + 1}
              parentSelected={true}
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
          ))}
        </BlockWrapper>
      )}
    </>
  );
};

export default PreviewRenderer;