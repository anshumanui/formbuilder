import React from "react";
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
} from "../assets/Main.styled";
import type { Field, Option, FieldType, Block } from "../features/types";
import { generateKeyFromLabel, createEmptyField } from "../utils";

interface FieldEditorProps {
  field: Field;
  level: number;
  block: Block;
  onChange: (updated: Field) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, level, block, onChange }) => {
  // Update a single option in a field
  const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
    const updatedOptions = (field.options || []).map((opt) =>
      opt.id === optionId ? updater(opt) : opt
    );
    onChange({ ...field, options: updatedOptions });
  };

  // Add a child field under an option
  const addChildField = (optionId: string) => {
    updateOption(optionId, (opt) => ({
      ...opt,
      children: [...(opt.children || []), { ...createEmptyField(), key: "" }],
    }));
  };

  // Remove a child field
  const removeChildField = (optionId: string, childIndex: number) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren.splice(childIndex, 1);
      return { ...opt, children: newChildren };
    });
  };

  // Update a child field
  const updateChildField = (optionId: string, index: number, updated: Field) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren[index] = updated;
      return { ...opt, children: newChildren };
    });
  };

  return (
    <FieldContainer level={level}>
      <InputLabel>Field Label</InputLabel>
      <TextInput
        value={field.label}
        onChange={(e) =>
          onChange({
            ...field,
            label: e.target.value,
            key: generateKeyFromLabel(e.target.value),
          })
        }
      />

      {level === 0 && (
        <LabelBlock>
          <CheckboxInput
            type="checkbox"
            checked={block.separateBlock || false}
            onChange={() =>
              onChange({ ...field }) // separateBlock is managed at block level in Redux
            }
          />
          Show children in separate block
        </LabelBlock>
      )}

      <InputLabel>Type</InputLabel>
      <SelectInput
        value={field.type}
        onChange={(e) =>
          onChange({ ...field, type: e.target.value as FieldType, options: [] })
        }
      >
        {level === 0 ? (
          <option value="radio">Radio</option>
        ) : (
          <>
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
            <option value="select">Select</option>
            <option value="numeric">Numeric</option>
          </>
        )}
      </SelectInput>

      {(field.type === "radio" ||
        field.type === "checkbox" ||
        field.type === "select") && (
        <>
          <InputLabel>Options</InputLabel>
          {(field.options || []).map((opt) => (
            <OptionWrapper key={opt.id}>
              <TextInput
                placeholder="Option text"
                value={opt.value}
                onChange={(e) =>
                  updateOption(opt.id, (o) => ({ ...o, value: e.target.value }))
                }
              />

              <OptionActions>
                <Button onClick={() => addChildField(opt.id)}>Add Child</Button>
              </OptionActions>

              {(opt.children || []).map((child, cIdx) => (
                <RemoveChildWrapper key={child.id}>
                  <FieldEditor
                    field={child}
                    level={level + 1}
                    block={block}
                    onChange={(upd) => updateChildField(opt.id, cIdx, upd)}
                  />
                  <RemoveButton onClick={() => removeChildField(opt.id, cIdx)}>
                    Remove Child
                  </RemoveButton>
                </RemoveChildWrapper>
              ))}
            </OptionWrapper>
          ))}

          <Button
            onClick={() =>
              onChange({
                ...field,
                options: [
                  ...(field.options || []),
                  { id: Math.random().toString(36).slice(2, 10), value: "", children: [] },
                ],
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
