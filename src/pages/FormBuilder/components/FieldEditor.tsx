import React from "react";
import { useDispatch } from 'react-redux';
import { setBlock } from "../../../store/slices/formSlice";
import type { Field, Block } from "../../../types";
import FieldConfig from "./FieldConfig";
import InputFieldConfig from "./InputFieldConfig";
import OptionsConfig from "./OptionsConfig";
import {
  FieldContainer,
  CheckboxInput,
} from "../../../assets/Components.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
  level: number;
  block: Block;
}

const FieldEditor: React.FC<Props> = ({ field, onChange, level, block }) => {
  const dispatch = useDispatch();

  const handleBlockChange = (updatedBlock: Block) => {
    dispatch(setBlock(updatedBlock));
  };

  const handleFieldSeparateBlock = (value: boolean) => {
    onChange({ ...field, separateBlock: value });
  };

  return (
    <FieldContainer $level={level}>
      {/* Top-level: Block configuration */}
      {level === 0 && (
        <>
          <label>
            <CheckboxInput
              type="checkbox"
              checked={block.separateBlock}
              onChange={(e) => handleBlockChange({ ...block, separateBlock: e.target.checked })}
            />
            Render as Separate Block?
          </label>

          <label>
            <CheckboxInput
              type="checkbox"
              checked={block.displayOrdering || false}
              onChange={(e) => handleBlockChange({ ...block, displayOrdering: e.target.checked })}
            />
            Display Ordering?
          </label>
        </>
      )}

      {/* Nested levels: Field separate block configuration */}
      {level > 0 && (
        <label>
          <CheckboxInput
            type="checkbox"
            checked={field.separateBlock || false}
            onChange={(e) => handleFieldSeparateBlock(e.target.checked)}
          />
          Render as Separate Block?
        </label>
      )}

      {/* Basic field configuration */}
      <FieldConfig field={field} onChange={onChange} />

      {/* Input-specific configuration */}
      <InputFieldConfig field={field} onChange={onChange} />

      {/* Options configuration */}
      <OptionsConfig 
        field={field} 
        onChange={onChange} 
        level={level} 
        block={block} 
        setBlock={handleBlockChange}
      />
    </FieldContainer>
  );
};

export default FieldEditor;