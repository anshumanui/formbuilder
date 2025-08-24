import React, { useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

// --- Types ---
type FieldType = "radio" | "text" | "checkbox" | "textarea" | "select" | "numeric";

interface Field {
  id: string;
  type: FieldType;
  label: string;
  value: string;
  mandatory?: boolean;
  placeholder?: string;
  maxChars?: number;
  icon?: string;
  iconAlignment?: "left" | "right";
  options?: Option[];
  decimalPoints?: 0 | 1 | 2;
}

interface Option {
  id: string;
  value: string;
  helperText?: string;
  children?: Field[];
}

interface Block {
  id: string;
  blockTitle: string;
  field: Field;
}

// --- Styled Components ---
const Container = styled.div`display: flex; height: 100vh;`;
const BuilderPanel = styled.div`flex: 1; padding: 20px; border-right: 1px solid #ddd; overflow-y: auto;`;
const PreviewPanel = styled.div`flex: 1; padding: 20px; overflow-y: auto; background: #fafafa;`;
const SectionTitle = styled.h2`margin-bottom: 20px;`;
const InputLabel = styled.label`display: block; margin-top: 12px; font-weight: 600;`;
const TextInput = styled.input`width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;`;
const SelectInput = styled.select`width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;`;
const CheckboxInput = styled.input`margin-right: 6px;`;
const Button = styled.button`margin-top: 10px; padding: 6px 12px; background: #eee; border: 1px solid #ccc; cursor: pointer; margin-right: 8px;`;
const FieldContainer = styled.div<{ level: number }>`margin-left: ${(p) => p.level * 20}px; padding: 12px 0; border-left: 2px solid #ccc; padding-left: 10px;`;
const PreviewBlock = styled.div`background: #fff; padding: 16px; margin-bottom: 16px; border-radius: 6px; box-shadow: 0 0 5px rgba(0,0,0,0.1);`;
const PreviewLabel = styled.label<{ mandatory?: boolean }>`font-weight: bold; display: block; margin-bottom: 4px; color: ${(p) => (p.mandatory ? "red" : "#000")};`;
const HelperText = styled.div`font-size: 12px; color: #666; margin-bottom: 8px;`;

// --- Helpers ---
const createEmptyField = (): Field => ({
  id: uuidv4(),
  type: "text",
  label: "",
  value: "",
});

const FormBuilder: React.FC = () => {
  const [block, setBlock] = useState<Block>({
    id: uuidv4(),
    blockTitle: "Your Form Block",
    field: {
      id: uuidv4(),
      type: "radio",
      label: "Choose an option",
      value: "",
      options: [
        { id: uuidv4(), value: "Option 1", helperText: "This is option 1", children: [] },
        { id: uuidv4(), value: "Option 2", helperText: "This is option 2", children: [] },
      ],
    },
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>({});

  const renderFieldEditor = (
    field: Field,
    onChange: (updated: Field) => void,
    level: number
  ) => {
    const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
      const updatedOptions = field.options?.map((opt) =>
        opt.id === optionId ? updater(opt) : opt
      );
      onChange({ ...field, options: updatedOptions });
    };

    const addChildField = (optionId: string) => {
      updateOption(optionId, (opt) => ({
        ...opt,
        children: [...(opt.children || []), createEmptyField()],
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
        <InputLabel>Field Label</InputLabel>
        <TextInput value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} />

        <InputLabel>Type</InputLabel>
        <SelectInput
          value={field.type}
          onChange={(e) => onChange({ ...field, type: e.target.value as FieldType, options: [] })}
        >
          {level === 0 ? (
            <>
              <option value="radio">Radio</option>
            </>
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

        <label>
          <CheckboxInput
            type="checkbox"
            checked={field.mandatory}
            onChange={() => onChange({ ...field, mandatory: !field.mandatory })}
          />
          Mandatory
        </label>

        {(field.type === "text" || field.type === "numeric") && (
          <>
            <InputLabel>Icon</InputLabel>
            <TextInput
              value={field.icon || ""}
              onChange={(e) => {
                const newIcon = e.target.value;
                onChange({
                  ...field,
                  icon: newIcon,
                  iconAlignment: newIcon ? (field.iconAlignment || "left") : undefined,
                });
              }}
              placeholder="e.g. 🔍"
            />
            {field.icon && (
              <>
                <InputLabel>Icon Alignment</InputLabel>
                <SelectInput
                  value={field.iconAlignment || "left"}
                  onChange={(e) =>
                    onChange({
                      ...field,
                      iconAlignment: e.target.value as "left" | "right",
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </SelectInput>
              </>
            )}
          </>
        )}

        {field.type === "numeric" && (
          <>
            <InputLabel>Decimal Points</InputLabel>
            <SelectInput
              value={field.decimalPoints ?? 0}
              onChange={(e) =>
                onChange({
                  ...field,
                  decimalPoints: parseInt(e.target.value) as 0 | 1 | 2,
                })
              }
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </SelectInput>
          </>
        )}

        {(field.type === "radio" || field.type === "checkbox" || field.type === "select") && (
          <>
            <InputLabel>Options</InputLabel>
            {field.options?.map((opt, idx) => (
              <div key={opt.id} style={{ marginBottom: 10 }}>
                <TextInput
                  placeholder="Option text"
                  value={opt.value}
                  onChange={(e) => updateOption(opt.id, o => ({ ...o, value: e.target.value }))}
                />
                {level === 0 && (
                  <TextInput
                    placeholder="Helper text"
                    value={opt.helperText || ""}
                    onChange={(e) => updateOption(opt.id, o => ({ ...o, helperText: e.target.value }))}
                  />
                )}
                <div style={{ marginTop: 6 }}>
                  <Button onClick={() => addChildField(opt.id)}>Add Child</Button>
                  {(opt.children ?? []).length > 0 && (
                    <Button onClick={() => updateOption(opt.id, o => ({ ...o, children: [] }))}>Remove All Children</Button>
                  )}
                </div>
                {opt.children?.map((child, cIdx) => (
                  <div key={child.id}>
                    {renderFieldEditor(child, (upd) => updateChildField(opt.id, cIdx, upd), level + 1)}
                    <Button
                      onClick={() => removeChildField(opt.id, cIdx)}
                      style={{ marginTop: 4, background: "#fdd", borderColor: "#d00", color: "#900" }}
                    >
                      Remove Child
                    </Button>
                  </div>
                ))}
              </div>
            ))}
            <Button
              onClick={() =>
                onChange({
                  ...field,
                  options: [...(field.options || []), { id: uuidv4(), value: "", children: [] }],
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

  const renderPreview = (field: Field, level = 0): React.ReactNode => {
    // --- Radio Field ---
    if (level === 0 && field.type === "radio") {
      return (
        <>
          <PreviewBlock>
            <PreviewLabel mandatory={field.mandatory}>{field.label}</PreviewLabel>
            {(field.options || []).map((opt) => (
              <div key={opt.id}>
                <label>
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={selectedOptions[field.id] === opt.id}
                    onChange={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [field.id]: opt.id,
                      }))
                    }
                  />{" "}
                  {opt.value}
                </label>
                {opt.helperText && <HelperText>{opt.helperText}</HelperText>}
              </div>
            ))}
          </PreviewBlock>

          {/* Only render children of the selected option */}
          {(field.options || []).map((opt) => {
            if (selectedOptions[field.id] === opt.id && opt.children) {
              return opt.children.map((child) => (
                <PreviewBlock key={child.id}>
                  {renderPreview(child, level + 1)}
                </PreviewBlock>
              ));
            }
            return null;
          })}
        </>
      );
    }

    // --- Other Field Types (text, textarea, checkbox, select, radio at nested levels) ---
    return (
      <FieldContainer level={level}>
        {field.label && (
          <PreviewLabel mandatory={field.mandatory}>{field.label}</PreviewLabel>
        )}

        {(field.type === "text" || field.type === "textarea") && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {field.icon && field.iconAlignment === "left" && (
              <span style={{ fontSize: 18 }}>{field.icon}</span>
            )}
            {field.type === "text" ? (
              <input placeholder={field.placeholder} maxLength={field.maxChars} />
            ) : (
              <textarea placeholder={field.placeholder} maxLength={field.maxChars} />
            )}
            {field.icon && field.iconAlignment === "right" && (
              <span style={{ fontSize: 18 }}>{field.icon}</span>
            )}
          </div>
        )}

        {field.type === "numeric" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {field.icon && field.iconAlignment === "left" && (
              <span style={{ fontSize: 18 }}>{field.icon}</span>
            )}
            <input
              placeholder={field.placeholder}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const value = target.value;
                const decimalPoints = field.decimalPoints ?? 0;

                const regexMap: Record<number, RegExp> = {
                  0: /^\d*$/,
                  1: /^\d*(\.\d{0,1})?$/,
                  2: /^\d*(\.\d{0,2})?$/,
                };

                const regex = regexMap[decimalPoints];
                if (!regex.test(value)) {
                  target.value = value.slice(0, -1);
                }
              }}
              inputMode="decimal"
            />
            {field.icon && field.iconAlignment === "right" && (
              <span style={{ fontSize: 18 }}>{field.icon}</span>
            )}
          </div>
        )}

        {field.type === "select" && (
          <select>
            {(field.options || []).map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        )}

        {field.type === "checkbox" && (
          <>
            {(field.options || []).map((opt) => (
              <div key={opt.id}>
                <label>
                  <input
                    type="checkbox"
                    name={field.id}
                    value={opt.value}
                    checked={!!checkedOptions[opt.id]}
                    onChange={() =>
                      setCheckedOptions((prev) => ({
                        ...prev,
                        [opt.id]: !prev[opt.id],
                      }))
                    }
                  />{" "}
                  {opt.value}
                </label>
                {/* Render children of checked checkbox */}
                {checkedOptions[opt.id] &&
                  opt.children?.map((child) => (
                    <PreviewBlock key={child.id}>
                      {renderPreview(child, level + 1)}
                    </PreviewBlock>
                  ))}
              </div>
            ))}
          </>
        )}

        {/* Nested radios (not root level) */}
        {field.type === "radio" && level > 0 && (
          <>
            {(field.options || []).map((opt) => (
              <div key={opt.id}>
                <label>
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={selectedOptions[field.id] === opt.id}
                    onChange={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [field.id]: opt.id,
                      }))
                    }
                  />{" "}
                  {opt.value}
                </label>
                {opt.helperText && <HelperText>{opt.helperText}</HelperText>}
                {selectedOptions[field.id] === opt.id &&
                  opt.children?.map((child) => (
                    <PreviewBlock key={child.id}>
                      {renderPreview(child, level + 1)}
                    </PreviewBlock>
                  ))}
              </div>
            ))}
          </>
        )}
      </FieldContainer>
    );
  };

  return (
    <Container>
      <BuilderPanel>
        <SectionTitle>Form Builder</SectionTitle>
        <InputLabel>Block Title</InputLabel>
        <TextInput
          value={block.blockTitle}
          onChange={(e) => setBlock({ ...block, blockTitle: e.target.value })}
        />
        {renderFieldEditor(block.field, (updated) => setBlock({ ...block, field: updated }), 0)}
      </BuilderPanel>
      <PreviewPanel>
        <SectionTitle>{block.blockTitle}</SectionTitle>
        {renderPreview(block.field)}
        <SectionTitle>JSON Output</SectionTitle>
        <pre>{JSON.stringify(block, null, 2)}</pre>
      </PreviewPanel>
    </Container>
  );
};

export default FormBuilder;
