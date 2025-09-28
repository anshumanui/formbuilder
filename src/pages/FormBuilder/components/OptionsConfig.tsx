import React from "react";
import type { Field, Option, Block } from "../types";
import { generateKeyFromLabel, idGenerator } from "../helpers";
import FieldEditor from "../FieldEditor";
import {
  InputLabel,
  TextInput,
  SelectInput,
  Button,
  OptionWrapper,
  OptionActions,
  RemoveChildWrapper,
  RemoveButton,
} from "../../../assets/Main.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
  level: number;
  block: Block;
  setBlock: React.Dispatch<React.SetStateAction<Block>>;
}

const OptionsConfig: React.FC<Props> = ({ field, onChange, level, block, setBlock }) => {
  const hasOptions = ["select", "radio", "checkbox", "multiselect"].includes(field.type);
  
  if (!hasOptions) return null;

  const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
    const updatedOptions = (field.options || []).map((opt) => 
      opt.id === optionId ? updater(opt) : opt
    );
    onChange({ ...field, options: updatedOptions });
  };

  const addChildField = (optionId: string) => {
    updateOption(optionId, (opt) => ({
      ...opt,
      children: [...(opt.children || []), { 
        id: idGenerator(),
        type: "text",
        label: "",
        key: "",
        value: ""
      }],
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
    <>
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

      <InputLabel>Options</InputLabel>
      {(field.options || []).map((opt, idx) => (
        <OptionWrapper key={opt.id}>
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
              onChange={(e) => updateOption(opt.id, (o) => ({ 
                ...o, 
                helperText: e.target.value 
              }))}
            />
          )}

          <RemoveButton
            type="button"
            onClick={() => onChange({ 
              ...field, 
              options: (field.options || []).filter((o) => o.id !== opt.id) 
            })}
          >
            Remove
          </RemoveButton>

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
                  onChange={(e) => updateOption(opt.id, (o) => ({ 
                    ...o, 
                    placement: e.target.value as "row" | "column" 
                  }))}
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
              <RemoveButton 
                type="button" 
                onClick={() => removeChildField(opt.id, childIdx)}
              >
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
  );
};

export default OptionsConfig;