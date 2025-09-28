import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Block } from "../../types/";
import { idGenerator } from "../../utils/helpers";

interface FormState {
  block: Block;
  fieldValues: Record<string, string>;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  multiSelectValues: Record<string, string[]>;
  clearedFields: Record<string, boolean>;
  isSubmitted: boolean;
  userResponseJSON: any;
}

const initialState: FormState = {
  block: {
    id: idGenerator(),
    separateBlock: false,
    displayOrdering: false,
    field: {
      id: idGenerator(),
      type: "radio",
      label: "Choose an option",
      key: "choose_an_option",
      value: "",
      options: [
        { id: idGenerator(), label: "Option 1", key: "option_1", helperText: "", children: [] },
        { id: idGenerator(), label: "Option 2", key: "option_2", helperText: "", children: [] },
      ],
    },
  },
  fieldValues: {},
  selectedOptions: {},
  checkedOptions: {},
  multiSelectValues: {},
  clearedFields: {},
  isSubmitted: false,
  userResponseJSON: {},
};

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
    setCheckedOption: (state, action: PayloadAction<{ optionId: string; value: boolean }>) => {
      state.checkedOptions[action.payload.optionId] = action.payload.value;
    },
    setMultiSelectValues: (state, action: PayloadAction<{ fieldId: string; values: string[] }>) => {
      state.multiSelectValues[action.payload.fieldId] = action.payload.values;
    },
    setClearedField: (state, action: PayloadAction<{ fieldId: string }>) => {
      state.clearedFields[action.payload.fieldId] = true;
    },
    setIsSubmitted: (state, action: PayloadAction<boolean>) => {
      state.isSubmitted = action.payload;
    },
    setUserResponseJSON: (state, action: PayloadAction<any>) => {
      state.userResponseJSON = action.payload;
    },
    resetForm: (state) => {
      state.fieldValues = {};
      state.selectedOptions = {};
      state.checkedOptions = {};
      state.multiSelectValues = {};
      state.clearedFields = {};
      state.isSubmitted = false;
      state.userResponseJSON = {};
    },
    setAllFormStates: (state, action: PayloadAction<{
      selectedOptions: Record<string, string>;
      checkedOptions: Record<string, boolean>;
      fieldValues: Record<string, string>;
      multiSelectValues: Record<string, string[]>;
    }>) => {
      const { selectedOptions, checkedOptions, fieldValues, multiSelectValues } = action.payload;
      state.selectedOptions = selectedOptions;
      state.checkedOptions = checkedOptions;
      state.fieldValues = fieldValues;
      state.multiSelectValues = multiSelectValues;
    },
  },
});

export const {
  setBlock,
  setFieldValue,
  setSelectedOption,
  setCheckedOption,
  setMultiSelectValues,
  setClearedField,
  setIsSubmitted,
  setUserResponseJSON,
  resetForm,
  setAllFormStates,
} = formSlice.actions;

export default formSlice.reducer;