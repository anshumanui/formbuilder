import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../store";
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

const FieldEditor: React.FC<Props> = ({ field, onChange, level }) => {
  const dispatch = useDispatch();
  const { block } = useSelector((state: RootState) => state.form);

  const handleBlockChange = (updatedBlock: Block) => {
    dispatch(setBlock(updatedBlock));
  };

  return (
    <FieldContainer $level={level}>
      {/* Only top-level: Block configuration */}
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