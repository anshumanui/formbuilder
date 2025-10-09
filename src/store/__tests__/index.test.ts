import { store } from '../index';
import { setFieldValue, setIsSubmitted, resetForm } from '../slices/formSlice';

describe('Redux Store Configuration', () => {
  describe('store initialization', () => {
    it('should initialize store with correct structure', () => {
      const state = store.getState();
      
      expect(state).toHaveProperty('form');
      expect(state.form).toHaveProperty('block');
      expect(state.form).toHaveProperty('fieldValues');
      expect(state.form).toHaveProperty('selectedOptions');
      expect(state.form).toHaveProperty('checkedOptions');
      expect(state.form).toHaveProperty('multiSelectValues');
      expect(state.form).toHaveProperty('clearedFields');
      expect(state.form).toHaveProperty('isSubmitted');
      expect(state.form).toHaveProperty('userResponseJSON');
    });

    it('should have form reducer with initial state', () => {
      const state = store.getState();
      
      expect(state.form.isSubmitted).toBe(false);
      expect(state.form.fieldValues).toEqual({});
      expect(state.form.selectedOptions).toEqual({});
      expect(state.form.checkedOptions).toEqual({});
      expect(state.form.multiSelectValues).toEqual({});
    });

    it('should have initial block with radio field', () => {
      const state = store.getState();
      
      expect(state.form.block).toBeDefined();
      expect(state.form.block.field.type).toBe('radio');
      expect(state.form.block.field.options).toHaveLength(2);
    });
  });

  describe('store dispatch', () => {
    beforeEach(() => {
      // Reset store to initial state before each test
      store.dispatch(resetForm());
    });

    it('should dispatch actions and update state', () => {
      store.dispatch(setFieldValue({ fieldId: 'test', value: 'test value' }));
      
      const state = store.getState();
      expect(state.form.fieldValues.test).toBe('test value');
    });

    it('should handle multiple dispatches', () => {
      store.dispatch(setFieldValue({ fieldId: 'field1', value: 'value1' }));
      store.dispatch(setFieldValue({ fieldId: 'field2', value: 'value2' }));
      store.dispatch(setIsSubmitted(true));
      
      const state = store.getState();
      expect(state.form.fieldValues.field1).toBe('value1');
      expect(state.form.fieldValues.field2).toBe('value2');
      expect(state.form.isSubmitted).toBe(true);
    });

    it('should reset form state correctly', () => {
      // Add some data
      store.dispatch(setFieldValue({ fieldId: 'field1', value: 'value1' }));
      store.dispatch(setIsSubmitted(true));
      
      // Verify data exists
      let state = store.getState();
      expect(state.form.fieldValues.field1).toBe('value1');
      expect(state.form.isSubmitted).toBe(true);
      
      // Reset
      store.dispatch(resetForm());
      
      // Verify reset
      state = store.getState();
      expect(state.form.fieldValues).toEqual({});
      expect(state.form.isSubmitted).toBe(false);
    });
  });

  describe('store getState', () => {
    it('should return current state snapshot', () => {
      const state1 = store.getState();
      const state2 = store.getState();
      
      expect(state1).toEqual(state2);
    });

    it('should return updated state after dispatch', () => {
      const stateBefore = store.getState();
      
      store.dispatch(setFieldValue({ fieldId: 'test', value: 'new value' }));
      
      const stateAfter = store.getState();
      
      expect(stateBefore.form.fieldValues).not.toEqual(stateAfter.form.fieldValues);
    });
  });

  describe('store subscribe', () => {
    it('should notify subscribers on state changes', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      
      store.dispatch(setFieldValue({ fieldId: 'test', value: 'value' }));
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      
      unsubscribe();
      
      store.dispatch(setFieldValue({ fieldId: 'test', value: 'value' }));
      
      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Type exports', () => {
    it('should export RootState type correctly', () => {
      const state = store.getState();
      
      // This is primarily a compile-time check
      // If types are correct, this should compile without errors
      const formState: typeof state.form = state.form;
      
      expect(formState).toBeDefined();
      expect(formState.block).toBeDefined();
    });
  });
});