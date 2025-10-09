import formReducer, {
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
  } from '../formSlice';
  import type { Block } from '../../../types';
  
  describe('formSlice', () => {
    const initialState = {
      block: {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'radio' as const,
          label: 'Choose an option',
          key: 'choose_an_option',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', helperText: '', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', helperText: '', children: [] },
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
  
    describe('initial state', () => {
      it('should have correct initial state', () => {
        const state = formReducer(undefined, { type: 'unknown' });
        
        expect(state.block).toBeDefined();
        expect(state.block.field.type).toBe('radio');
        expect(state.block.field.options).toHaveLength(2);
        expect(state.fieldValues).toEqual({});
        expect(state.selectedOptions).toEqual({});
        expect(state.checkedOptions).toEqual({});
        expect(state.multiSelectValues).toEqual({});
        expect(state.clearedFields).toEqual({});
        expect(state.isSubmitted).toBe(false);
        expect(state.userResponseJSON).toEqual({});
      });
    });
  
    describe('setBlock', () => {
      it('should set the block', () => {
        const newBlock: Block = {
          id: 'newblock',
          separateBlock: true,
          displayOrdering: true,
          field: {
            id: 'newfield',
            type: 'text',
            label: 'New Field',
            key: 'new_field',
            value: '',
          },
        };
  
        const state = formReducer(initialState, setBlock(newBlock));
        
        expect(state.block).toEqual(newBlock);
        expect(state.block.id).toBe('newblock');
        expect(state.block.separateBlock).toBe(true);
        expect(state.block.displayOrdering).toBe(true);
      });
    });
  
    describe('setFieldValue', () => {
      it('should set field value', () => {
        const state = formReducer(
          initialState,
          setFieldValue({ fieldId: 'field1', value: 'test value' })
        );
        
        expect(state.fieldValues.field1).toBe('test value');
      });
  
      it('should update existing field value', () => {
        const stateWithValue = {
          ...initialState,
          fieldValues: { field1: 'old value' },
        };
        
        const state = formReducer(
          stateWithValue,
          setFieldValue({ fieldId: 'field1', value: 'new value' })
        );
        
        expect(state.fieldValues.field1).toBe('new value');
      });
  
      it('should handle multiple field values', () => {
        let state = formReducer(
          initialState,
          setFieldValue({ fieldId: 'field1', value: 'value1' })
        );
        
        state = formReducer(
          state,
          setFieldValue({ fieldId: 'field2', value: 'value2' })
        );
        
        expect(state.fieldValues).toEqual({
          field1: 'value1',
          field2: 'value2',
        });
      });
    });
  
    describe('setSelectedOption', () => {
      it('should set selected option for radio field', () => {
        const state = formReducer(
          initialState,
          setSelectedOption({ fieldId: 'field1', optionId: 'opt1' })
        );
        
        expect(state.selectedOptions.field1).toBe('opt1');
      });
  
      it('should update selected option', () => {
        const stateWithSelection = {
          ...initialState,
          selectedOptions: { field1: 'opt1' },
        };
        
        const state = formReducer(
          stateWithSelection,
          setSelectedOption({ fieldId: 'field1', optionId: 'opt2' })
        );
        
        expect(state.selectedOptions.field1).toBe('opt2');
      });
  
      it('should handle multiple radio fields', () => {
        let state = formReducer(
          initialState,
          setSelectedOption({ fieldId: 'field1', optionId: 'opt1' })
        );
        
        state = formReducer(
          state,
          setSelectedOption({ fieldId: 'field2', optionId: 'opt3' })
        );
        
        expect(state.selectedOptions).toEqual({
          field1: 'opt1',
          field2: 'opt3',
        });
      });
    });
  
    describe('setCheckedOption', () => {
      it('should set checked option to true', () => {
        const state = formReducer(
          initialState,
          setCheckedOption({ optionId: 'opt1', value: true })
        );
        
        expect(state.checkedOptions.opt1).toBe(true);
      });
  
      it('should set checked option to false', () => {
        const stateWithChecked = {
          ...initialState,
          checkedOptions: { opt1: true },
        };
        
        const state = formReducer(
          stateWithChecked,
          setCheckedOption({ optionId: 'opt1', value: false })
        );
        
        expect(state.checkedOptions.opt1).toBe(false);
      });
  
      it('should handle multiple checked options', () => {
        let state = formReducer(
          initialState,
          setCheckedOption({ optionId: 'opt1', value: true })
        );
        
        state = formReducer(
          state,
          setCheckedOption({ optionId: 'opt2', value: true })
        );
        
        state = formReducer(
          state,
          setCheckedOption({ optionId: 'opt3', value: true })
        );
        
        expect(state.checkedOptions).toEqual({
          opt1: true,
          opt2: true,
          opt3: true,
        });
      });
    });
  
    describe('setMultiSelectValues', () => {
      it('should set multiselect values', () => {
        const state = formReducer(
          initialState,
          setMultiSelectValues({ fieldId: 'field1', values: ['opt1', 'opt2'] })
        );
        
        expect(state.multiSelectValues.field1).toEqual(['opt1', 'opt2']);
      });
  
      it('should update multiselect values', () => {
        const stateWithValues = {
          ...initialState,
          multiSelectValues: { field1: ['opt1'] },
        };
        
        const state = formReducer(
          stateWithValues,
          setMultiSelectValues({ fieldId: 'field1', values: ['opt1', 'opt2', 'opt3'] })
        );
        
        expect(state.multiSelectValues.field1).toEqual(['opt1', 'opt2', 'opt3']);
      });
  
      it('should handle empty array', () => {
        const state = formReducer(
          initialState,
          setMultiSelectValues({ fieldId: 'field1', values: [] })
        );
        
        expect(state.multiSelectValues.field1).toEqual([]);
      });
    });
  
    describe('setClearedField', () => {
      it('should mark field as cleared', () => {
        const state = formReducer(
          initialState,
          setClearedField({ fieldId: 'field1' })
        );
        
        expect(state.clearedFields.field1).toBe(true);
      });
  
      it('should handle multiple cleared fields', () => {
        let state = formReducer(
          initialState,
          setClearedField({ fieldId: 'field1' })
        );
        
        state = formReducer(
          state,
          setClearedField({ fieldId: 'field2' })
        );
        
        expect(state.clearedFields).toEqual({
          field1: true,
          field2: true,
        });
      });
    });
  
    describe('setIsSubmitted', () => {
      it('should set isSubmitted to true', () => {
        const state = formReducer(initialState, setIsSubmitted(true));
        
        expect(state.isSubmitted).toBe(true);
      });
  
      it('should set isSubmitted to false', () => {
        const stateWithSubmitted = {
          ...initialState,
          isSubmitted: true,
        };
        
        const state = formReducer(stateWithSubmitted, setIsSubmitted(false));
        
        expect(state.isSubmitted).toBe(false);
      });
    });
  
    describe('setUserResponseJSON', () => {
      it('should set user response JSON', () => {
        const responseData = {
          field1: { value: 'test' },
          field2: { selected: true },
        };
        
        const state = formReducer(
          initialState,
          setUserResponseJSON(responseData)
        );
        
        expect(state.userResponseJSON).toEqual(responseData);
      });
  
      it('should update user response JSON', () => {
        const oldResponse = { field1: { value: 'old' } };
        const newResponse = { field1: { value: 'new' } };
        
        const stateWithResponse = {
          ...initialState,
          userResponseJSON: oldResponse,
        };
        
        const state = formReducer(
          stateWithResponse,
          setUserResponseJSON(newResponse)
        );
        
        expect(state.userResponseJSON).toEqual(newResponse);
      });
    });
  
    describe('resetForm', () => {
      it('should reset all form state except block', () => {
        const stateWithData = {
          ...initialState,
          fieldValues: { field1: 'value' },
          selectedOptions: { field1: 'opt1' },
          checkedOptions: { opt1: true },
          multiSelectValues: { field1: ['opt1'] },
          clearedFields: { field1: true },
          isSubmitted: true,
          userResponseJSON: { data: 'test' },
        };
        
        const state = formReducer(stateWithData, resetForm());
        
        expect(state.fieldValues).toEqual({});
        expect(state.selectedOptions).toEqual({});
        expect(state.checkedOptions).toEqual({});
        expect(state.multiSelectValues).toEqual({});
        expect(state.clearedFields).toEqual({});
        expect(state.isSubmitted).toBe(false);
        expect(state.userResponseJSON).toEqual({});
        expect(state.block).toEqual(stateWithData.block); // Block should remain
      });
    });
  
    describe('setAllFormStates', () => {
      it('should set all form states at once', () => {
        const formStates = {
          selectedOptions: { field1: 'opt1' },
          checkedOptions: { opt1: true, opt2: false },
          fieldValues: { field1: 'value1', field2: 'value2' },
          multiSelectValues: { field1: ['opt1', 'opt2'] },
        };
        
        const state = formReducer(initialState, setAllFormStates(formStates));
        
        expect(state.selectedOptions).toEqual(formStates.selectedOptions);
        expect(state.checkedOptions).toEqual(formStates.checkedOptions);
        expect(state.fieldValues).toEqual(formStates.fieldValues);
        expect(state.multiSelectValues).toEqual(formStates.multiSelectValues);
      });
  
      it('should replace existing form states', () => {
        const stateWithData = {
          ...initialState,
          fieldValues: { oldField: 'oldValue' },
          selectedOptions: { oldField: 'oldOpt' },
        };
        
        const formStates = {
          selectedOptions: { newField: 'newOpt' },
          checkedOptions: { newOpt: true },
          fieldValues: { newField: 'newValue' },
          multiSelectValues: { newField: ['opt1'] },
        };
        
        const state = formReducer(stateWithData, setAllFormStates(formStates));
        
        expect(state.selectedOptions).toEqual(formStates.selectedOptions);
        expect(state.fieldValues).toEqual(formStates.fieldValues);
        expect(state.selectedOptions).not.toHaveProperty('oldField');
        expect(state.fieldValues).not.toHaveProperty('oldField');
      });
    });
  
    describe('action creators', () => {
      it('should create setBlock action', () => {
        const block: Block = {
          id: 'test',
          field: {
            id: 'field',
            type: 'text',
            label: 'Test',
            key: 'test',
            value: '',
          },
        };
        
        const action = setBlock(block);
        
        expect(action.type).toBe('form/setBlock');
        expect(action.payload).toEqual(block);
      });
  
      it('should create setFieldValue action', () => {
        const action = setFieldValue({ fieldId: 'field1', value: 'test' });
        
        expect(action.type).toBe('form/setFieldValue');
        expect(action.payload).toEqual({ fieldId: 'field1', value: 'test' });
      });
  
      it('should create setSelectedOption action', () => {
        const action = setSelectedOption({ fieldId: 'field1', optionId: 'opt1' });
        
        expect(action.type).toBe('form/setSelectedOption');
        expect(action.payload).toEqual({ fieldId: 'field1', optionId: 'opt1' });
      });
    });
  });