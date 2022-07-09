export default {
  REQUIRED: {
    context: { label: 'REQUIRED' },
    reducer: ({ getValue }) => getValue() !== '',
  },
  GREATER_THAN_ZERO: {
    context: { label: 'GREATER_THAN_ZERO' },
    reducer: ({ getValue }) => Number(getValue()) > 0,
  },
  ALL_CHILDREN_VALID: {
    context: { label: 'ALL_CHILDREN_VALID' },
    reducer: ({ getReduction, getValue }) =>
      Object.keys(getValue()).every(
        (k) => getReduction('isValid', k)?.value !== false
      ),
  },
};
