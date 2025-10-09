import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NumericFieldPreview from '../NumericFieldPreview';
import formReducer from '../../../../../store/slices/formSlice';
import type { Field, Block } from '../../../../../types';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      form: formReducer,
    },
    preloadedState: initialState,
  });
};

const mockField: Field = {
  id: 'field1',
  type: 'numeric',
  label: 'Test Numeric',
  key: 'test_numeric',
  value: '',
  placeholder: 'Enter number',
  decimalPoints: 0,
};

const mockBlock: Block = {
  id: 'block1',
  field: mockField,
  separateBlock: false,
};

describe('NumericFieldPreview', () => {
  it('renders numeric input with placeholder', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });

  it('accepts only numeric values with 0 decimal points', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    
    // Valid input
    fireEvent.change(input, { target: { value: '123' } });
    let state = store.getState();
    expect(state.form.fieldValues.field1).toBe('123');

    // Invalid input (with decimals when decimalPoints is 0)
    fireEvent.change(input, { target: { value: '123.45' } });
    state = store.getState();
    // Should still be '123' as it shouldn't accept decimals
    expect(state.form.fieldValues.field1).toBe('123');
  });

  it('accepts numeric values with 1 decimal point', () => {
    const fieldWith1Decimal: Field = {
      ...mockField,
      decimalPoints: 1,
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={fieldWith1Decimal} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    
    fireEvent.change(input, { target: { value: '123.4' } });
    let state = store.getState();
    expect(state.form.fieldValues.field1).toBe('123.4');

    // Should not accept 2 decimal places
    fireEvent.change(input, { target: { value: '123.45' } });
    state = store.getState();
    expect(state.form.fieldValues.field1).toBe('123.4');
  });

  it('accepts numeric values with 2 decimal points', () => {
    const fieldWith2Decimals: Field = {
      ...mockField,
      decimalPoints: 2,
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={fieldWith2Decimals} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    
    fireEvent.change(input, { target: { value: '123.45' } });
    const state = store.getState();
    expect(state.form.fieldValues.field1).toBe('123.45');
  });

  it('rejects non-numeric characters', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: '123' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    
    fireEvent.change(input, { target: { value: 'abc' } });
    const state = store.getState();
    // Should still be '123' as it shouldn't accept letters
    expect(state.form.fieldValues.field1).toBe('123');
  });

  it('renders icon on the left when iconAlignment is left', () => {
    const fieldWithIcon: Field = {
      ...mockField,
      icon: '💰',
      iconAlignment: 'left',
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={fieldWithIcon} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('renders icon on the right when iconAlignment is right', () => {
    const fieldWithIcon: Field = {
      ...mockField,
      icon: '%',
      iconAlignment: 'right',
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={fieldWithIcon} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview 
          field={mockField} 
          block={mockBlock} 
          error="Please enter a valid number" 
        />
      </Provider>
    );

    expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
  });

  it('displays field value from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: '456.78' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    const fieldWith2Decimals: Field = {
      ...mockField,
      decimalPoints: 2,
    };

    render(
      <Provider store={store}>
        <NumericFieldPreview field={fieldWith2Decimals} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement;
    expect(input.value).toBe('456.78');
  });

  it('allows empty value', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <NumericFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter number');
    fireEvent.change(input, { target: { value: '' } });

    const state = store.getState();
    expect(state.form.fieldValues.field1).toBe('');
  });
});