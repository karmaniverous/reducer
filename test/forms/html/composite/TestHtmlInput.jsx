// npm imports
import PropTypes from 'prop-types';

// subject imports
import { useReducer } from '../../../../src';

const TestHtmlInput = ({ id, type }) => {
  const { getValue, reduce } = useReducer();

  return (
    <input
      data-testid={id}
      type={type}
      value={getValue()}
      onChange={(e) => reduce(e.target.value)}
    />
  );
};

TestHtmlInput.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
};

export default TestHtmlInput;
