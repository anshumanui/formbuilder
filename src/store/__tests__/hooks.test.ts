import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../hooks';
import formReducer from '../slices/formSlice';
import type { ReactNode } from 'react';

const createMockStore = () => {
  return configureStore({
    reducer: {
      form: formReducer,
    },
  });
};

const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('Store Hooks', () => {
  describe('useAppDispatch', () => {
    it('should return dispatch function', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('function');
    });

    it('should dispatch actions correctly', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      // Dispatch a simple action
      result.current({ type: 'form/setIsSubmitted', payload: true });

      const state = store.getState();
      expect(state.form.isSubmitted).toBe(true);
    });
  });

  describe('useAppSelector', () => {
    it('should select state from store', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector((state) => state.form.isSubmitted),
        { wrapper }
      );

      expect(result.current).toBe(false);
    });

    it('should return updated state when store changes', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result, rerender } = renderHook(
        () => useAppSelector((state) => state.form.isSubmitted),
        { wrapper }
      );

      expect(result.current).toBe(false);

      // Update store
      store.dispatch({ type: 'form/setIsSubmitted', payload: true });
      rerender();

      expect(result.current).toBe(true);
    });

    it('should select nested state correctly', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector((state) => state.form.block.field.type),
        { wrapper }
      );

      expect(result.current).toBe('radio');
    });

    it('should select multiple state properties', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector((state) => ({
          isSubmitted: state.form.isSubmitted,
          fieldValues: state.form.fieldValues,
        })),
        { wrapper }
      );

      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.fieldValues).toEqual({});
    });
  });

  describe('Type Safety', () => {
    it('useAppDispatch should have correct typing', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      // TypeScript should allow dispatching valid actions
      // This is primarily a compile-time check, but we can verify runtime behavior
      expect(() => {
        result.current({ type: 'form/resetForm' });
      }).not.toThrow();
    });

    it('useAppSelector should have correct typing', () => {
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // TypeScript should enforce correct state structure
      const { result } = renderHook(
        () => useAppSelector((state) => state.form),
        { wrapper }
      );

      expect(result.current).toHaveProperty('block');
      expect(result.current).toHaveProperty('fieldValues');
      expect(result.current).toHaveProperty('selectedOptions');
      expect(result.current).toHaveProperty('checkedOptions');
      expect(result.current).toHaveProperty('multiSelectValues');
    });
  });
});