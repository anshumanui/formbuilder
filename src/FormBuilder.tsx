import React, { useState } from "react";
import FormRenderer from "./FormRenderer"; 

// Types
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

const elementTypes: ElementType[] = [
  "checkbox",
  "radio",
  "range",
  "textarea",
  "text",
  "select"
];

const iconTypes: IconType[] = ["currency", "email", "notification"];

const createDefaultElement = (): FormElement => ({
  id: Math.random().toString(36).slice(2, 10),
  type: "text",
  label: "",
  value: "",
  icon: "",
  iconAlignment: "left",
  mandatory: false,
  hasNested: false,
  nestedElements: [],
});

const createDefaultRow = (): FormRow => ({
  id: Math.random().toString(36).slice(2, 10),
  text: "",
  elements: [createDefaultElement()],
});

const createDefaultSubSection = (): SubSection => ({
  id: Math.random().toString(36).slice(2, 10),
  title: "",
  rows: [createDefaultRow()],
});

const createDefaultSection = (): Section => ({
  id: Math.random().toString(36).slice(2, 10),
  subSections: [createDefaultSubSection()],
});

const FormBuilder: React.FC = () => {
  const [form, setForm] = useState<FormBuilderState>({
    title: "",
    sections: [createDefaultSection()],
  });

  const [showRenderer, setShowRenderer] = useState(false);

  // Helper to generate unique IDs
  const uid = () => Math.random().toString(36).slice(2, 10);

  // Handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  // SECTION HANDLERS
  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, createDefaultSection()],
    }));
  };

  const removeSection = (sectionIdx: number) => {
    setForm((prev) => {
      if (prev.sections.length === 1) return prev;
      const sections = [...prev.sections];
      sections.splice(sectionIdx, 1);
      return { ...prev, sections };
    });
  };

  // SUBSECTION HANDLERS
  const addSubSection = (sectionIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        return {
          ...section,
          subSections: [...section.subSections, createDefaultSubSection()],
        };
      });
      return { ...prev, sections };
    });
  };

  const removeSubSection = (sectionIdx: number, subIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        if (section.subSections.length === 1) return section;
        const newSubSections = [...section.subSections];
        newSubSections.splice(subIdx, 1);
        return { ...section, subSections: newSubSections };
      });
      return { ...prev, sections };
    });
  };

  const handleSubSectionTitle = (sectionIdx: number, subIdx: number, value: string) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) =>
          sIdx === subIdx ? { ...sub, title: value } : sub
        );
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  // ROW HANDLERS
  const addFormRow = (sectionIdx: number, subIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          return { ...sub, rows: [...sub.rows, createDefaultRow()] };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const removeFormRow = (sectionIdx: number, subIdx: number, rowIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          if (sub.rows.length === 1) return sub;
          const newRows = [...sub.rows];
          newRows.splice(rowIdx, 1);
          return { ...sub, rows: newRows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const handleRowText = (sectionIdx: number, subIdx: number, rowIdx: number, value: string) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) =>
            rIdx === rowIdx ? { ...row, text: value } : row
          );
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const handleRowShow = (sectionIdx: number, subIdx: number, rowIdx: number, value: boolean) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) =>
            rIdx === rowIdx ? { ...row, show: value } : row
          );
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  // ELEMENT HANDLERS
  const addFormElement = (sectionIdx: number, subIdx: number, rowIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            return { ...row, elements: [...row.elements, createDefaultElement()] };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const removeFormElement = (sectionIdx: number, subIdx: number, rowIdx: number, elemIdx: number) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            if (row.elements.length === 1) return row;
            const newElements = [...row.elements];
            newElements.splice(elemIdx, 1);
            return { ...row, elements: newElements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const addNestedFormElement = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              return {
                ...el,
                nestedElements: el.nestedElements
                  ? [...el.nestedElements, createDefaultElement()]
                  : [createDefaultElement()],
              };
            });
            return { ...row, elements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const removeNestedFormElement = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number,
    nIdx: number
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              if (!el.nestedElements || el.nestedElements.length === 1) return el;
              const newNested = [...el.nestedElements];
              newNested.splice(nIdx, 1);
              return { ...el, nestedElements: newNested };
            });
            return { ...row, elements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const handleElementChange = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number,
    key: keyof FormElement,
    value: any
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              if (key === "hasNested") {
                if (value) {
                  return {
                    ...el,
                    hasNested: true,
                    nestedElements: el.nestedElements && el.nestedElements.length > 0
                      ? el.nestedElements
                      : [createDefaultElement()],
                  };
                } else {
                  return { ...el, hasNested: false, nestedElements: [] };
                }
              }
              return { ...el, [key]: value };
            });
            return { ...row, elements };
          });
          return { ...sub, rows };
        });
        return { ...section, subSections };
      });
      return { ...prev, sections };
    });
  };

  const handleNestedElementChange = (
    sectionIdx: number,
    subIdx: number,
    rowIdx: number,
    elemIdx: number,
    nIdx: number,
    key: keyof FormElement,
    value: any
  ) => {
    setForm((prev) => {
      const sections = prev.sections.map((section, idx) => {
        if (idx !== sectionIdx) return section;
        const subSections = section.subSections.map((sub, sIdx) => {
          if (sIdx !== subIdx) return sub;
          const rows = sub.rows.map((row, rIdx) => {
            if (rIdx !== rowIdx) return row;
            const elements = row.elements.map((el, eIdx) => {
              if (eIdx !== elemIdx) return el;
              const nestedElements = el.nestedElements
                ? el.nestedElements.map((nEl, nElIdx) =>
                    nElIdx === nIdx ? { ...nEl, [key]: value } : nEl
                  )
                : [];
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
  };

  return (
    <div style={{ padding: 24, display: 'flex', gap: '2rem' }}>
      <div>
        <h2>Form Builder</h2>
        <div style={{ marginBottom: 16 }}>
          <label>
            Form Title:{" "}
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              style={{ marginRight: 16 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={addSection}
            title="Add Section"
            style={{ marginRight: 8 }}
          >
            ➕ Add Section
          </button>
        </div>
        {form.sections.map((section, sectionIdx) => (
          <div key={section.id} style={{ border: "1px solid #ccc", marginBottom: 16, padding: 12 }}>
            <h3>
              Section {sectionIdx + 1}{" "}
              {form.sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(sectionIdx)}
                  title="Remove Section"
                  style={{ marginLeft: 8, color: "red" }}
                >
                  ➖
                </button>
              )}
              <button
                type="button"
                onClick={() => addSubSection(sectionIdx)}
                title="Add Subsection"
                style={{ marginLeft: 8 }}
              >
                ➕ Add Subsection
              </button>
            </h3>
            {section.subSections.map((sub, subIdx) => (
              <div key={sub.id} style={{ marginLeft: 24, marginBottom: 12, borderLeft: "2px solid #eee", paddingLeft: 12 }}>
                <div>
                  <label>
                    Subsection Title:{" "}
                    <input
                      type="text"
                      value={sub.title || ""}
                      onChange={(e) => handleSubSectionTitle(sectionIdx, subIdx, e.target.value)}
                    />
                  </label>
                  {section.subSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubSection(sectionIdx, subIdx)}
                      title="Remove Subsection"
                      style={{ marginLeft: 8, color: "red" }}
                    >
                      ➖
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => addFormRow(sectionIdx, subIdx)}
                    title="Add Form Row"
                    style={{ marginLeft: 8 }}
                  >
                    ➕ Add Row
                  </button>
                </div>
                {sub.rows.map((row, rowIdx) => (
                  <div key={row.id} style={{ marginLeft: 24, marginBottom: 8, borderLeft: "2px dashed #ddd", paddingLeft: 12 }}>
                    <div>
                      <label>
                        Row Text:{" "}
                        <input
                          type="text"
                          value={row.text || ""}
                          onChange={(e) => handleRowText(sectionIdx, subIdx, rowIdx, e.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => addFormElement(sectionIdx, subIdx, rowIdx)}
                        title="Add Form Element"
                        style={{ marginLeft: 8 }}
                      >
                        ➕ Add Element
                      </button>
                      {sub.rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormRow(sectionIdx, subIdx, rowIdx)}
                          title="Remove Form Row"
                          style={{ marginLeft: 8, color: "red" }}
                        >
                          ➖
                        </button>
                      )}
                    </div>
                    {row.elements.map((elem, elemIdx) => (
                      <div key={elem.id} style={{ marginLeft: 24, marginBottom: 4, borderLeft: "2px dotted #eee", paddingLeft: 12 }}>
                        <div>
                          <label>
                            Type:{" "}
                            <select
                              value={elem.type}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "type", e.target.value)
                              }
                            >
                              {elementTypes.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label style={{ marginLeft: 8 }}>
                            Label:{" "}
                            <input
                              type="text"
                              value={elem.label || ""}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "label", e.target.value)
                              }
                            />
                          </label>
                          <label style={{ marginLeft: 8 }}>
                            Icon:{" "}
                            <select
                              value={elem.icon || ""}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "icon", e.target.value)
                              }
                            >
                              <option value="">None</option>
                              {iconTypes.map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label style={{ marginLeft: 8 }}>
                            Icon Alignment:{" "}
                            <select
                              value={elem.iconAlignment}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "iconAlignment", e.target.value as IconAlignment)
                              }
                            >
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>
                          </label>
                          <label style={{ marginLeft: 8 }}>
                            Mandatory:{" "}
                            <input
                              type="checkbox"
                              checked={!!elem.mandatory}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "mandatory", e.target.checked)
                              }
                            />
                          </label>
                          <label style={{ marginLeft: 8 }}>
                            Further Action:{" "}
                            <input
                              type="checkbox"
                              checked={!!elem.hasNested}
                              onChange={(e) =>
                                handleElementChange(sectionIdx, subIdx, rowIdx, elemIdx, "hasNested", e.target.checked)
                              }
                            />
                          </label>
                          {elem.hasNested && (
                            <button
                              type="button"
                              onClick={() => addNestedFormElement(sectionIdx, subIdx, rowIdx, elemIdx)}
                              title="Add Nested Element"
                              style={{ marginLeft: 8 }}
                            >
                              ➕ Add Nested Element
                            </button>
                          )}
                          {row.elements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFormElement(sectionIdx, subIdx, rowIdx, elemIdx)}
                              title="Remove Form Element"
                              style={{ marginLeft: 8, color: "red" }}
                            >
                              ➖
                            </button>
                          )}
                        </div>
                        {/* Render nested elements recursively */}
                        {elem.hasNested && elem.nestedElements && elem.nestedElements.length > 0 && (
                          <div style={{ marginLeft: 24, marginTop: 4 }}>
                            {elem.nestedElements.map((nested, nIdx) => (
                              <div key={nested.id} style={{ borderLeft: "2px solid #bbb", paddingLeft: 8, marginBottom: 4 }}>
                                <label>
                                  Type:{" "}
                                  <select
                                    value={nested.type}
                                    onChange={(e) =>
                                      handleNestedElementChange(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx,
                                        "type",
                                        e.target.value
                                      )
                                    }
                                  >
                                    {elementTypes.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                  Label:{" "}
                                  <input
                                    type="text"
                                    value={nested.label || ""}
                                    onChange={(e) =>
                                      handleNestedElementChange(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                  />
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                  Icon:{" "}
                                  <select
                                    value={nested.icon || ""}
                                    onChange={(e) =>
                                      handleNestedElementChange(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx,
                                        "icon",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">None</option>
                                    {iconTypes.map((icon) => (
                                      <option key={icon} value={icon}>
                                        {icon}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                  Icon Alignment:{" "}
                                  <select
                                    value={nested.iconAlignment}
                                    onChange={(e) =>
                                      handleNestedElementChange(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx,
                                        "iconAlignment",
                                        e.target.value as IconAlignment
                                      )
                                    }
                                  >
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                  </select>
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                  Mandatory:{" "}
                                  <input
                                    type="checkbox"
                                    checked={!!nested.mandatory}
                                    onChange={(e) =>
                                      handleNestedElementChange(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx,
                                        "mandatory",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </label>
                                {elem.nestedElements && elem.nestedElements.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeNestedFormElement(
                                        sectionIdx,
                                        subIdx,
                                        rowIdx,
                                        elemIdx,
                                        nIdx
                                      )
                                    }
                                    title="Remove Nested Element"
                                    style={{ marginLeft: 8, color: "red" }}
                                  >
                                    ➖
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <h4>Form JSON Preview</h4>
        <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4 }}>
          {JSON.stringify(form, null, 2)}
        </pre>
        {!showRenderer && (
          <button
            style={{ marginTop: 16, padding: "8px 16px" }}
            onClick={() => setShowRenderer(true)}
          >
            Submit & Render Form
          </button>
        )}
        {showRenderer && (
          <div style={{ marginTop: 24 }}>
            <FormRenderer form={form} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;