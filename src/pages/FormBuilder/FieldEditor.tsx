import React from "react";
import type { Field, Option, Block } from "./types";
import { createEmptyField, generateKeyFromLabel, idGenerator } from "./helpers";
import {
  FieldContainer,
  InputLabel,
  TextInput,
  SelectInput,
  CheckboxInput,
  Button,
  LabelBlock,
  OptionWrapper,
  OptionActions,
  RemoveChildWrapper,
  RemoveButton,
} from "../../assets/Main.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
  level: number;
  block: Block;
  setBlock: React.Dispatch<React.SetStateAction<Block>>;
}

const FieldEditor: React.FC<Props> = ({ field, onChange, level, block, setBlock }) => {
  const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
    const updatedOptions = (field.options || []).map((opt) => (opt.id === optionId ? updater(opt) : opt));
    onChange({ ...field, options: updatedOptions });
  };

  const addChildField = (optionId: string) => {
    updateOption(optionId, (opt) => ({
      ...opt,
      children: [...(opt.children || []), { ...createEmptyField(), key: "" }],
    }));
  };

  const removeChildField = (optionId: string, childIndex: number) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren.splice(childIndex, 1);
      return { ...opt, children: newChildren };
    });
  };

  const updateChildField = (optionId: string, index: number, updated: Field) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren[index] = updated;
      return { ...opt, children: newChildren };
    });
  };

  return (
    <FieldContainer level={level}>
      {/* Only top-level: Render as separate block */}
      {level === 0 && (
        <>
          <label>
            <CheckboxInput
              type="checkbox"
              checked={block.separateBlock}
              onChange={(e) => setBlock({ ...block, separateBlock: e.target.checked })}
            />
            Render as Separate Block?
          </label>

          <label>
            <CheckboxInput
              type="checkbox"
              checked={block.displayOrdering || false}
              onChange={(e) => setBlock({ ...block, displayOrdering: e.target.checked })}
            />
            Display Ordering?
          </label>
        </>
      )}

      {/* Label */}
      <InputLabel>Field Label</InputLabel>
      <TextInput
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value, key: generateKeyFromLabel(e.target.value) })}
      />

      {/* Order - NEW */}
      <InputLabel>Order</InputLabel>
      <TextInput
        type="number"
        value={field.order || ""}
        onChange={(e) => onChange({ ...field, order: e.target.value ? parseInt(e.target.value) : undefined })}
        placeholder="Field display order (optional)"
        min="1"
      />

      {/* Mandatory */}
      <label>
        <CheckboxInput
          type="checkbox"
          checked={field.mandatory || false}
          onChange={(e) => onChange({ ...field, mandatory: e.target.checked })}
        />
        Mandatory Field
      </label>

      {/* Block Element */}
      <label>
        <CheckboxInput
          type="checkbox"
          checked={field.blockElement || false}
          onChange={(e) => onChange({ ...field, blockElement: e.target.checked })}
        />
        Block Element (Full Width)
      </label>

      {/* Custom Error Message */}
      {field.mandatory && (
        <>
          <InputLabel>Custom Error Message (optional)</InputLabel>
          <TextInput
            value={field.errorMessage || ""}
            onChange={(e) => onChange({ ...field, errorMessage: e.target.value })}
            placeholder="This field is required"
          />
        </>
      )}

      {/* Type */}
      <InputLabel>Field Type</InputLabel>
      <SelectInput value={field.type} onChange={(e) => onChange({ ...field, type: e.target.value as any })}>
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="numeric">Numeric</option>
        <option value="radio">Radio</option>
        <option value="checkbox">Checkbox</option>
        <option value="select">Select</option>
        <option value="multiselect">Multi-Select</option>
      </SelectInput>

      {/* Common Props */}
      {(field.type === "text" || field.type === "textarea" || field.type === "numeric") && (
        <>
          <InputLabel>Placeholder</InputLabel>
          <TextInput
            value={field.placeholder || ""}
            onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
          />

          <InputLabel>Icon</InputLabel>
          <TextInput value={field.icon || ""} onChange={(e) => onChange({ ...field, icon: e.target.value })} />

          <InputLabel>Icon Alignment</InputLabel>
          <SelectInput
            value={field.iconAlignment || "left"}
            onChange={(e) => onChange({ ...field, iconAlignment: e.target.value as "left" | "right" })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </SelectInput>

          {field.type === "textarea" && (
            <>
              <InputLabel>Max Characters</InputLabel>
              <TextInput
                type="number"
                value={field.maxChars || ""}
                onChange={(e) => onChange({ ...field, maxChars: parseInt(e.target.value) || undefined })}
              />
            </>
          )}
        </>
      )}

      {field.type === "numeric" && (
        <>
          <InputLabel>Decimal Points</InputLabel>
          <SelectInput
            value={field.decimalPoints || 0}
            onChange={(e) => onChange({ ...field, decimalPoints: parseInt(e.target.value) as 0 | 1 | 2 })}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </SelectInput>
        </>
      )}

      {/* Multi-select specific options */}
      {field.type === "multiselect" && (
        <>
          <InputLabel>Max Selections (optional)</InputLabel>
          <TextInput
            type="number"
            value={field.maxSelections || ""}
            onChange={(e) => onChange({ 
              ...field, 
              maxSelections: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </>
      )}

      {/* Options for radio / checkbox / select / multiselect */}
      {(field.type === "select" || field.type === "radio" || field.type === "checkbox" || field.type === "multiselect") && (
        <>
          <InputLabel>Options</InputLabel>
          {(field.options || []).map((opt, idx) => (
            <OptionWrapper key={opt.id}>
              <LabelBlock>
                <TextInput
                  placeholder={`Option ${idx + 1}`}
                  value={opt.label}
                  onChange={(e) => updateOption(opt.id, (o) => ({ 
                    ...o, 
                    label: e.target.value,
                    key: generateKeyFromLabel(e.target.value)
                  }))}
                />

                {/* Only show helper text input for top-level elements */}
                {level === 0 && (
                  <TextInput
                    placeholder="Helper Text"
                    value={opt.helperText || ""}
                    onChange={(e) => updateOption(opt.id, (o) => ({ ...o, helperText: e.target.value }))}
                  />
                )}

                <RemoveButton
                  type="button"
                  onClick={() => onChange({ ...field, options: (field.options || []).filter((o) => o.id !== opt.id) })}
                >
                  Remove
                </RemoveButton>
              </LabelBlock>

              <OptionActions>
                <Button type="button" onClick={() => addChildField(opt.id)}>
                  Add Child Field
                </Button>
                
                {/* Show placement option if this option has children */}
                {(opt.children || []).length > 0 && (
                  <>
                    <InputLabel>Children Layout</InputLabel>
                    <SelectInput
                      value={opt.placement || "column"}
                      onChange={(e) => updateOption(opt.id, (o) => ({ ...o, placement: e.target.value as "row" | "column" }))}
                    >
                      <option value="column">Column</option>
                      <option value="row">Row</option>
                    </SelectInput>
                  </>
                )}
              </OptionActions>

              {(opt.children || []).map((child, childIdx) => (
                <RemoveChildWrapper key={child.id}>
                  <FieldEditor
                    field={child}
                    onChange={(updated) => updateChildField(opt.id, childIdx, updated)}
                    level={level + 1}
                    block={block}
                    setBlock={setBlock}
                  />
                  <RemoveButton type="button" onClick={() => removeChildField(opt.id, childIdx)}>
                    Remove Child
                  </RemoveButton>
                </RemoveChildWrapper>
              ))}
            </OptionWrapper>
          ))}

          <Button
            type="button"
            onClick={() =>
              onChange({
                ...field,
                options: [...(field.options || []), { 
                  id: idGenerator(), 
                  label: "", 
                  key: "",
                  helperText: "", 
                  children: [] 
                }],
              })
            }
          >
            Add Option
          </Button>
        </>
      )}
    </FieldContainer>
  );
};

export default FieldEditor;