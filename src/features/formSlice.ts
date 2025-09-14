// features/formSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Block } from "./types";

// State interface
interface FormState {
  block: Block;
  fieldValues: Record<string, string>;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, Record<string, boolean>>;
  clearedFields: Record<string, boolean>;
  isSubmitted: boolean;
}

// Initial state
const initialState: FormState = {
  block: {
    id: "root",
    blockTitle: "Your Form Block",
    separateBlock: false,
    field: {
      id: "field_root",
      type: "radio",
      label: "Choose an option",
      key: "choose_an_option",
      value: "",
      options: [
        { id: "opt1", value: "Option 1", helperText: "This is option 1", children: [] },
        { id: "opt2", value: "Option 2", helperText: "This is option 2", children: [] },
      ],
    },
  },
  fieldValues: {},
  selectedOptions: {},
  checkedOptions: {},
  clearedFields: {},
  isSubmitted: false,
};

// Slice
const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setBlock: (state, action: PayloadAction<Block>) => {
      state.block = action.payload;
    },
    setFieldValue: (state, action: PayloadAction<{ fieldId: string; value: string }>) => {
      state.fieldValues[action.payload.fieldId] = action.payload.value;
    },
    setSelectedOption: (state, action: PayloadAction<{ fieldId: string; optionId: string }>) => {
      state.selectedOptions[action.payload.fieldId] = action.payload.optionId;
    },
    setCheckedOption: (state, action: PayloadAction<{ fieldId: string; optionId: string; value: boolean }>) => {
      const { fieldId, optionId, value } = action.payload;
      if (!state.checkedOptions[fieldId]) state.checkedOptions[fieldId] = {};
      state.checkedOptions[fieldId][optionId] = value;
    },
    setClearedField: (state, action: PayloadAction<{ fieldId: string }>) => {
      state.clearedFields[action.payload.fieldId] = true;
    },
    setIsSubmitted: (state, action: PayloadAction<boolean>) => {
      state.isSubmitted = action.payload;
    },
  },
});

export const {
  setBlock,
  setFieldValue,
  setSelectedOption,
  setCheckedOption,
  setClearedField,
  setIsSubmitted,
} = formSlice.actions;

export default formSlice.reducer;
