import React from "react";
import type { Field, Block } from "./types";
import FieldConfig from "./components/FieldConfig";
import InputFieldConfig from "./components/InputFieldConfig";
import OptionsConfig from "./components/OptionsConfig";
import {
  FieldContainer,
  CheckboxInput,
} from "../../assets/Main.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
  level: number;
  block: Block;
  setBlock: React.Dispatch<React.SetStateAction<Block>>;
}

const FieldEditor: React.FC<Props> = ({ field, onChange, level, block, setBlock }) => {
  return (
    <FieldContainer level={level}>
      {/* Only top-level: Block configuration */}
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
        setBlock={setBlock} 
      />
    </FieldContainer>
  );
};

export default FieldEditor;