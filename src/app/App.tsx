// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// import FormBuilder from "../features/form/FormBuilder";
// import FormPreview from "../features/form/FormPreview";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <nav style={{ marginBottom: "1rem" }}>
//         <Link to="/builder" style={{ marginRight: 8 }}>Form Builder</Link>
//         <Link to="/preview">Form Preview</Link>
//       </nav>

//       <Routes>
//         <Route path="/builder" element={<FormBuilder />} />
//         <Route path="/preview" element={<FormPreview />} />
//         <Route path="*" element={<FormBuilder />} /> {/* default */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

import FormBuilder from "../features/FormBuilder";
import FormPreview from "../features/FormPreview";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div style={{ flex: 1 }}>
        <FormBuilder />
      </div>
      <div style={{ flex: 1 }}>
        <FormPreview />
      </div>
    </div>
  );
}
