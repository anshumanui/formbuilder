import React, { useState } from "react";

// Types (reuse from FormBuilder)
type IconAlignment = "left" | "right";
type ElementType = "checkbox" | "radio" | "range" | "textarea" | "text" | "select";
type IconType = "currency" | "email" | "notification";

interface FormElement {
  id: string;
  type: ElementType;
  label?: string;
  value?: string;
  icon?: IconType | "";
  iconAlignment?: IconAlignment;
  mandatory?: boolean;
  hasNested?: boolean;
  nestedElements?: FormElement[];
}

interface FormRow {
  id: string;
  text?: string;
  elements: FormElement[];
}

interface SubSection {
  id: string;
  title?: string;
  rows: FormRow[];
}

interface Section {
  id: string;
  subSections: SubSection[];
}

interface FormBuilderState {
  title: string;
  sections: Section[];
}

interface FormRendererProps {
  form: FormBuilderState;
  onSubmit?: (form: FormBuilderState) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form: initialForm, onSubmit }) => {
  const [form, setForm] = useState<FormBuilderState>(JSON.parse(JSON.stringify(initialForm)));
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  // New: Track errors per element by id
  const [elementErrors, setElementErrors] = useState<Record<string, string>>({});

  // Toggle row panel
  const handleRowToggle = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Handle element value change (recursive for nested)
  const handleElementValueChange = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number,
    value: string
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, sIdx) => {
        if (sIdx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, ssIdx) => {
          if (ssIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              return { ...el, value };
            });
            return { ...row, elements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
    // Clear error for this element on change
    const el = form.sections[sectionIdx].subSections[subIdx].rows[rowIdx].elements[elemIdx];
    setElementErrors((prev) => ({ ...prev, [el.id]: "" }));
  };

  // Handle nested element value change
  const handleNestedElementValueChange = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number,
    nIdx: number,
    value: string
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, sIdx) => {
        if (sIdx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, ssIdx) => {
          if (ssIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              const nestedElements = el.nestedElements?.map((nEl, nElIdx) =>
                nElIdx === nIdx ? { ...nEl, value } : nEl
              );
              return { ...el, nestedElements };
            });
            return { ...row, elements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
    // Clear error for this nested element on change
    const nEl = form.sections[sectionIdx].subSections[subIdx].rows[rowIdx].elements[elemIdx].nestedElements?.[nIdx];
    if (nEl) setElementErrors((prev) => ({ ...prev, [nEl.id]: "" }));
  };

  // Validate mandatory fields and collect errors per element id
  const validate = (): string[] => {
    const errors: string[] = [];
    const elErrors: Record<string, string> = {};
    form.sections.forEach((section, sectionIdx) => {
      section.subSections.forEach((sub, subIdx) => {
        sub.rows.forEach((row, rowIdx) => {
          row.elements.forEach((el, elemIdx) => {
            if (el.mandatory && !el.value) {
              const msg = `This field is mandatory`;
              errors.push(
                `Section ${sectionIdx + 1}, Subsection ${subIdx + 1}, Row "${row.text}", Element "${el.label || el.type}" is mandatory`
              );
              elErrors[el.id] = msg;
            }
            if (el.hasNested && el.nestedElements) {
              el.nestedElements.forEach((nEl, nIdx) => {
                if (nEl.mandatory && !nEl.value) {
                  const msg = `This field is mandatory`;
                  errors.push(
                    `Section ${sectionIdx + 1}, Subsection ${subIdx + 1}, Row "${row.text}", Nested Element "${nEl.label || nEl.type}" is mandatory`
                  );
                  elErrors[nEl.id] = msg;
                }
              });
            }
          });
        });
      });
    });
    setElementErrors(elErrors);
    return errors;
  };

  // Render a single form element

const renderElement = (
  el: FormElement,
  sectionIdx: number,
  subIdx: number,
  rowIdx: number,
  elemIdx: number,
  nested?: boolean
) => {
  const inputProps = {
    value: el.value || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      handleElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, e.target.value),
    required: !!el.mandatory,
    style: { marginLeft: 8, marginRight: 8 },
  };

  let input: React.ReactNode = null;
  switch (el.type) {
    case "text":
      input = <input type="text" {...inputProps} />;
      break;
    case "textarea":
      input = <textarea {...inputProps} />;
      break;
    case "checkbox":
      input = (
        <input
          type="checkbox"
          checked={el.value === "true"}
          onChange={(e) =>
            handleElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, e.target.checked ? "true" : "")
          }
          required={!!el.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "radio":
      input = (
        <input
          type="radio"
          checked={el.value === "true"}
          onChange={(e) =>
            handleElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, e.target.checked ? "true" : "")
          }
          required={!!el.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "range":
      input = (
        <input
          type="range"
          value={el.value || ""}
          min={0}
          max={100}
          onChange={(e) => handleElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, e.target.value)}
          required={!!el.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "select":
      input = (
        <select
          {...inputProps}
        >
          <option value="">Select...</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      );
      break;
    default:
      input = <input type="text" {...inputProps} />;
  }

  // Inline error message below the input
  const errorMsg =
    elementErrors[el.id]
      ? (
        <div style={{ color: "red", fontSize: 13, marginTop: 2 }}>
          {el.label || el.type} can't be left empty
        </div>
      )
      : null;

  return (
    <div style={{ marginBottom: 8, marginLeft: nested ? 24 : 0 }}>
      {el.label && <label>{el.label}{el.mandatory && <span style={{ color: "red" }}> *</span>}</label>}
      {input}
      {errorMsg}
      {/* Render nested elements if any */}
      {el.hasNested && el.nestedElements && el.nestedElements.length > 0 && (
        <div style={{ marginLeft: 24, borderLeft: "2px solid #eee", paddingLeft: 8 }}>
          {el.nestedElements.map((nEl, nIdx) =>
            renderNestedElement(
              nEl,
              sectionIdx,
              subIdx,
              rowIdx,
              elemIdx,
              nIdx
            )
          )}
        </div>
      )}
    </div>
  );
};

const renderNestedElement = (
  nEl: FormElement,
  sectionIdx: number,
  subIdx: number,
  rowIdx: number,
  elemIdx: number,
  nIdx: number
) => {
  const inputProps = {
    value: nEl.value || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      handleNestedElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, nIdx, e.target.value),
    required: !!nEl.mandatory,
    style: { marginLeft: 8, marginRight: 8 },
  };

  let input: React.ReactNode = null;
  switch (nEl.type) {
    case "text":
      input = <input type="text" {...inputProps} />;
      break;
    case "textarea":
      input = <textarea {...inputProps} />;
      break;
    case "checkbox":
      input = (
        <input
          type="checkbox"
          checked={nEl.value === "true"}
          onChange={(e) =>
            handleNestedElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, nIdx, e.target.checked ? "true" : "")
          }
          required={!!nEl.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "radio":
      input = (
        <input
          type="radio"
          checked={nEl.value === "true"}
          onChange={(e) =>
            handleNestedElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, nIdx, e.target.checked ? "true" : "")
          }
          required={!!nEl.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "range":
      input = (
        <input
          type="range"
          value={nEl.value || ""}
          min={0}
          max={100}
          onChange={(e) => handleNestedElementValueChange(sectionIdx, subIdx, rowIdx, elemIdx, nIdx, e.target.value)}
          required={!!nEl.mandatory}
          style={{ marginLeft: 8, marginRight: 8 }}
        />
      );
      break;
    case "select":
      input = (
        <select {...inputProps}>
          <option value="">Select...</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      );
      break;
    default:
      input = <input type="text" {...inputProps} />;
  }

  // Inline error message below the input
  const errorMsg =
    elementErrors[nEl.id]
      ? (
        <div style={{ color: "red", fontSize: 13, marginTop: 2 }}>
          {nEl.label || nEl.type} can't be left empty
        </div>
      )
      : null;

  return (
    <div style={{ marginBottom: 8 }}>
      {nEl.label && <label>{nEl.label}{nEl.mandatory && <span style={{ color: "red" }}> *</span>}</label>}
      {input}
      {errorMsg}
    </div>
  );
};


  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length === 0 && onSubmit) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 700 }}>
      <h2>{form.title}</h2>
      {form.sections.map((section, sectionIdx) => (
        <div key={sectionIdx} style={{ border: "1px solid #ccc", marginBottom: 16, padding: 12 }}>
          {section.subSections.map((sub, subIdx) => (
            <div key={subIdx} style={{ marginLeft: 16, marginBottom: 12 }}>
              {sub.title && <h4>{sub.title}</h4>}
              {sub.rows.map((row, rowIdx) => (
                <div key={row.id} style={{ marginBottom: 12, borderBottom: "1px dashed #eee", paddingBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!expandedRows[row.id]}
                      onChange={() => handleRowToggle(row.id)}
                      style={{ marginRight: 8 }}
                    />
                    <span>{row.text}</span>
                  </div>
                  {expandedRows[row.id] && (
                    <div style={{ marginLeft: 24, marginTop: 8, background: "#fafafa", padding: 12, borderRadius: 4 }}>
                      {row.elements.map((el, elemIdx) =>
                        renderElement(el, sectionIdx, subIdx, rowIdx, elemIdx)
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      {/* Form-level errors (not per-field) */}
      {errors.length > 0 && (
        <div style={{ color: "red", marginBottom: 12 }}>
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="submit" style={{ marginTop: 16 }}>
        Submit
      </button>
    </form>
  );
};

export default FormRenderer;