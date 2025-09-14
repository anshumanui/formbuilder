import React, { useState, useEffect } from "react";
import {
  Container,
  BuilderPanel,
  PreviewPanel,
  SectionTitle,
  InputLabel,
  TextInput,
  SelectInput,
  CheckboxInput,
  Button,
  FieldContainer,
  PreviewBlock,
  PreviewLabel,
  HelperText,
  ChildrenContainer,
  LabelBlock,
  OptionWrapper,
  OptionActions,
  RemoveChildWrapper,
  RemoveButton,
  RelativeTextareaWrapper,
  CharCounter,
  ErrorHelper,
  SmallIcon,
  FlexRow,
  OptionContainer,
} from "./assets/Main.styled";

// --- Types ---
type FieldType = "radio" | "text" | "checkbox" | "textarea" | "select" | "numeric";

interface Field {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  value: string;
  mandatory?: boolean;
  errorMessage?: string;
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
  placement?: "row" | "column";
}

interface Block {
  id: string;
  blockTitle: string;
  field: Field;
  separateBlock?: boolean;
}

const idGenerator = () => Math.random().toString(36).slice(2, 10);

// --- Helpers ---
const createEmptyField = (): Field => ({
  id: idGenerator(),
  type: "text",
  label: "",
  key: "",
  value: "",
});

const generateKeyFromLabel = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove non-alphanum
    .trim()
    .split(/\s+/)
    .join("_");
};

const cleanBlockForExport = (block: Block): any => {
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
            value: opt.value,
          };

          if (opt.helperText) optCleaned.helperText = opt.helperText;

          if (opt.children && opt.children.length > 0) {
            const cleanedChildren = opt.children
              .map(cleanField)
              .filter((c) => c !== null);

            if (cleanedChildren.length > 0) {
              optCleaned.children = cleanedChildren;
            }
          }

          return optCleaned;
        })
        .filter((o) => o.value); // Remove options with no value
    }

    return cleaned;
  };

  return {
    id: block.id,
    blockTitle: block.blockTitle,
    separateBlock: block.separateBlock || false,
    field: cleanField(block.field),
  };
};

// Check if a field should be validated based on parent selection
const shouldValidateField = (field: Field, parentSelected: boolean): boolean => {
  return parentSelected && field.mandatory === true;
};

// Return error string if applicable, else null
const getErrorForField = (
  field: Field,
  parentSelected: boolean,
  isSubmitted: boolean,
  fieldValues: Record<string, any>,
  clearedFields: Record<string, boolean>
): string | null => {
  if (!shouldValidateField(field, parentSelected)) return null;

  const value = fieldValues[field.id];
  const hasValue =
    value !== undefined &&
    value !== null &&
    (typeof value === "string" ? value.trim() !== "" : true);

  // Show error on submit if no value
  if (isSubmitted && !hasValue) {
    // If user has already interacted with this field after submit and cleared it,
    // don't show the error for that particular field until next submit.
    if (clearedFields[field.id]) return null;
    return field.errorMessage || "This field is required.";
  }

  return null;
};

const renderFieldEditor = (
  field: Field,
  onChange: (updated: Field) => void,
  level: number,
  block: Block,
  setBlock: React.Dispatch<React.SetStateAction<Block>>
) => {
  const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
    const updatedOptions = (field.options || []).map((opt) =>
      opt.id === optionId ? updater(opt) : opt
    );
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
              setBlock((prev) => ({
                ...prev,
                separateBlock: !prev.separateBlock,
              }))
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

      {level > 0 && (
        <>
          <LabelBlock>
            <CheckboxInput
              type="checkbox"
              checked={field.mandatory || false}
              onChange={() =>
                onChange({
                  ...field,
                  mandatory: !field.mandatory,
                  errorMessage: !field.mandatory
                    ? field.errorMessage ?? "This field is required."
                    : undefined,
                })
              }
            />
            Mandatory
          </LabelBlock>

          {field.mandatory && (
            <>
              <InputLabel>Error Message</InputLabel>
              <TextInput
                value={field.errorMessage || ""}
                onChange={(e) =>
                  onChange({
                    ...field,
                    errorMessage: e.target.value,
                  })
                }
                placeholder="Enter error message to show in preview"
              />
            </>
          )}
        </>
      )}

      {(field.type === "text" ||
        field.type === "numeric" ||
        field.type === "textarea") && (
        <>
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
                    iconAlignment: newIcon ? field.iconAlignment || "left" : undefined,
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

          {field.type === "textarea" && (
            <>
              <InputLabel>Max Characters</InputLabel>
              <TextInput
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={field.maxChars ?? ""}
                onChange={(e) =>
                  onChange({
                    ...field,
                    maxChars: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
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
              {level === 0 && (
                <TextInput
                  placeholder="Helper text"
                  value={opt.helperText || ""}
                  onChange={(e) =>
                    updateOption(opt.id, (o) => ({ ...o, helperText: e.target.value }))
                  }
                />
              )}
              {opt.children && opt.children.length > 0 && (
                <>
                  <InputLabel>Children Placement</InputLabel>
                  <SelectInput
                    value={opt.placement || "column"} // default
                    onChange={(e) =>
                      updateOption(opt.id, (o) => ({
                        ...o,
                        placement: e.target.value as "row" | "column",
                      }))
                    }
                  >
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                  </SelectInput>
                </>
              )}
              <OptionActions>
                <Button onClick={() => addChildField(opt.id)}>Add Child</Button>
                {(opt.children || []).length > 0 && (
                  <Button
                    onClick={() =>
                      updateOption(opt.id, (o) => ({ ...o, children: [] }))
                    }
                  >
                    Remove All Children
                  </Button>
                )}
              </OptionActions>
              {(opt.children || []).map((child, cIdx) => (
                <RemoveChildWrapper key={child.id}>
                  {renderFieldEditor(child, (upd) => updateChildField(opt.id, cIdx, upd), level + 1, block, setBlock)}
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
                  { id: idGenerator(), value: "", children: [] },
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

const FormBuilder: React.FC = () => {
  const [block, setBlock] = useState<Block>({
    id: idGenerator(),
    blockTitle: "Your Form Block",
    separateBlock: false,
    field: {
      id: idGenerator(),
      type: "radio",
      label: "Choose an option",
      key: generateKeyFromLabel("Choose an option"),
      value: "",
      options: [
        {
          id: idGenerator(),
          value: "Option 1",
          helperText: "This is option 1",
          children: [],
        },
        {
          id: idGenerator(),
          value: "Option 2",
          helperText: "This is option 2",
          children: [],
        },
      ],
    },
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  // clearedFields tracks per-field "user interacted after submit" so we can hide that field's error until next submit
  const [clearedFields, setClearedFields] = useState<Record<string, boolean>>({});

  // auto-select first option for top-level radio
  useEffect(() => {
    if (
      block.field.type === "radio" &&
      !selectedOptions[block.field.id] &&
      block.field.options &&
      block.field.options.length > 0
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        [block.field.id]: block.field.options![0].id, // first option auto-selected
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  // helper to mark a field as interacted -> used to clear that field's error immediately (after submit)
  const markFieldCleared = (fieldId: string) => {
    setClearedFields((prev) => ({ ...prev, [fieldId]: true }));
  };

  // children layout (wraps children in a single PreviewBlock + ChildrenContainer)
  const renderPreview = (field: Field, level = 0, parentSelected = true): React.ReactNode => {
    const inheritedMandatory = field.mandatory ?? false;
    const error = getErrorForField(field, parentSelected, isSubmitted, fieldValues, clearedFields);

    const childrenLayout = (children: Field[], placement: "row" | "column", level: number) => {
      return (
        <PreviewBlock level={level}>
          <ChildrenContainer placement={placement}>
            {children.map((child) => (
              <OptionContainer key={child.id}>
                {renderPreview(
                  { ...child, mandatory: child.mandatory ?? inheritedMandatory },
                  level + 1,
                  parentSelected
                )}
              </OptionContainer>
            ))}
          </ChildrenContainer>
        </PreviewBlock>
      );
    };

    // --- Top-level Radio (level=0) ---
    if (level === 0 && field.type === "radio") {
      const selectedOpt = (field.options || []).find(opt => selectedOptions[field.id] === opt.id);
      const selectedChildren = selectedOpt?.children || [];
      const placement = selectedOpt?.placement || "column";

      if (block.separateBlock) {
        return (
          <>
            <PreviewBlock level={level}>
              <PreviewLabel>{field.label}</PreviewLabel>
              {(field.options || []).map((opt) => (
                <OptionWrapper key={opt.id}>
                  <label>
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={selectedOptions[field.id] === opt.id}
                      onChange={() => {
                        setSelectedOptions((prev) => ({ ...prev, [field.id]: opt.id }));
                        // Clear per-field cleared flags for nested fields because we changed selection
                        setClearedFields({});
                      }}
                    />
                    {opt.value}
                  </label>
                  {opt.helperText && <HelperText>{opt.helperText}</HelperText>}
                </OptionWrapper>
              ))}
            </PreviewBlock>

            {selectedChildren.length > 0 && childrenLayout(selectedChildren, placement, level + 1)}
          </>
        );
      }

      return (
        <PreviewBlock level={level}>
          <PreviewLabel>{field.label}</PreviewLabel>
          {(field.options || []).map((opt) => (
            <OptionWrapper key={opt.id}>
              <label>
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={selectedOptions[field.id] === opt.id}
                  onChange={() => {
                    setSelectedOptions((prev) => ({ ...prev, [field.id]: opt.id }));
                    // reset clearedFields for nested children when top-level selection changes
                    setClearedFields({});
                  }}
                />
                {opt.value}
              </label>
              {opt.helperText && <HelperText>{opt.helperText}</HelperText>}
            </OptionWrapper>
          ))}

          {selectedChildren.length > 0 && childrenLayout(selectedChildren, placement, level + 1)}
        </PreviewBlock>
      );
    }

    // --- Other Field Types ---
    return (
      <FieldContainer level={level}>
        {field.label && <PreviewLabel>{field.label}</PreviewLabel>}

        {/* Text & Textarea */}
        {(field.type === "text" || field.type === "textarea") && (
          <>
            <FlexRow>
              {field.icon && field.iconAlignment === "left" && (
                <SmallIcon>{field.icon}</SmallIcon>
              )}

              {field.type === "text" ? (
                <>
                  <input
                    placeholder={field.placeholder}
                    maxLength={field.maxChars}
                    value={fieldValues[field.id] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValues((prev) => ({ ...prev, [field.id]: value }));
                      // mark field as cleared so its error disappears immediately after typing (if submit was clicked before)
                      markFieldCleared(field.id);
                    }}
                    onBlur={() => { /* no-op */ }}
                  />
                  {error && <ErrorHelper>{error}</ErrorHelper>}
                </>
              ) : (
                <>
                  <RelativeTextareaWrapper>
                    <textarea
                      placeholder={field.placeholder}
                      maxLength={field.maxChars}
                      value={fieldValues[field.id] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!field.maxChars || value.length <= field.maxChars) {
                          setFieldValues((prev) => ({ ...prev, [field.id]: value }));
                          markFieldCleared(field.id);
                        }
                      }}
                      style={{ width: "100%", minHeight: 100, paddingBottom: 20 }}
                    />
                    {field.maxChars && (
                      <CharCounter>
                        {(fieldValues[field.id]?.length || 0)} / {field.maxChars}
                      </CharCounter>
                    )}
                  </RelativeTextareaWrapper>
                  {error && <ErrorHelper>{error}</ErrorHelper>}
                </>
              )}

              {field.icon && field.iconAlignment === "right" && (
                <SmallIcon>{field.icon}</SmallIcon>
              )}
            </FlexRow>
          </>
        )}

        {/* Numeric */}
        {field.type === "numeric" && (
          <>
            <input
              inputMode="decimal"
              placeholder={field.placeholder}
              value={fieldValues[field.id] || ""}
              onChange={(e) => {
                const value = e.target.value;
                const dp = field.decimalPoints ?? 0;
                const regexMap: Record<number, RegExp> = {
                  0: /^\d*$/,
                  1: /^\d*(\.\d{0,1})?$/,
                  2: /^\d*(\.\d{0,2})?$/,
                };
                if (regexMap[dp].test(value)) {
                  setFieldValues((prev) => ({ ...prev, [field.id]: value }));
                  markFieldCleared(field.id);
                }
              }}
            />
            {error && <ErrorHelper>{error}</ErrorHelper>}
          </>
        )}

        {/* Select */}
        {field.type === "select" && (
          <>
            <select
              value={fieldValues[field.id] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFieldValues((prev) => ({ ...prev, [field.id]: value }));
                // selecting a different option should reset cleared flags for nested fields
                setClearedFields({});
              }}
            >
              <option value="">-- Select --</option>
              {(field.options || []).map((opt) => (
                <option key={opt.id} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>

            {/* error immediately below select */}
            {error && <ErrorHelper>{error}</ErrorHelper>}

            {/* children below select (only if a value selected) */}
            {fieldValues[field.id] &&
              (field.options || [])
                .find((opt) => opt.value === fieldValues[field.id])
                ?.children &&
              childrenLayout(
                (field.options || []).find((opt) => opt.value === fieldValues[field.id])!.children!,
                (field.options || []).find((opt) => opt.value === fieldValues[field.id])!.placement || "column",
                level + 1
              )}
          </>
        )}

        {/* Checkbox */}
        {field.type === "checkbox" && (
          <>
            {(field.options || []).map((opt) => (
              <OptionWrapper key={opt.id}>
                <label>
                  <input
                    type="checkbox"
                    name={field.id}
                    value={opt.value}
                    checked={!!checkedOptions[opt.id]}
                    onChange={() => {
                      setCheckedOptions((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }));
                      // when toggling a checkbox, clear nested clearedFields since tree changed
                      setClearedFields({});
                    }}
                  />{" "}
                  {opt.value}
                </label>

                {checkedOptions[opt.id] &&
                  opt.children &&
                  opt.children.length > 0 &&
                  childrenLayout(opt.children, opt.placement || "column", level + 1)}
              </OptionWrapper>
            ))}
            {error && <ErrorHelper>{error}</ErrorHelper>}
          </>
        )}

        {/* Nested Radio */}
        {field.type === "radio" && level > 0 && (
          <>
            {(field.options || []).map((opt) => (
              <OptionWrapper key={opt.id}>
                <label>
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={selectedOptions[field.id] === opt.id}
                    onChange={() => {
                      setSelectedOptions((prev) => ({ ...prev, [field.id]: opt.id }));
                      // selecting nested radio should clear nested cleared flags
                      setClearedFields({});
                    }}
                  />{" "}
                  {opt.value}
                </label>
                {opt.helperText && <HelperText>{opt.helperText}</HelperText>}
                {selectedOptions[field.id] === opt.id &&
                  opt.children &&
                  opt.children.length > 0 &&
                  childrenLayout(opt.children, opt.placement || "column", level + 1)}
              </OptionWrapper>
            ))}
            {error && <ErrorHelper>{error}</ErrorHelper>}
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
        {renderFieldEditor(block.field, (updated) => setBlock({ ...block, field: updated }), 0, block, setBlock)}
      </BuilderPanel>
      <PreviewPanel>
        <SectionTitle>{block.blockTitle}</SectionTitle>
        {renderPreview(block.field)}
        <Button
          onClick={() => {
            // on every submit we should re-evaluate and not keep per-field cleared flags
            setClearedFields({});
            setIsSubmitted(true);
          }}
        >
          Submit
        </Button>
        <SectionTitle>JSON Output</SectionTitle>
        <pre>{JSON.stringify(cleanBlockForExport(block), null, 2)}</pre>
      </PreviewPanel>
    </Container>
  );
};

export default FormBuilder;
