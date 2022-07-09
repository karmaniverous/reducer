/* eslint-env mocha */

import { render } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

import chai from 'chai';
chai.should();

import { inspect } from 'util';
import { useState } from 'react';
import Reducer, { decodeReducerData, encodeReducerData } from '../src/index';

const REDUCERS = {
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

const Test = () => {
  const [state, setState] = useState(
    encodeReducerData({ form: { textInput: 'abc', numberInput: '123' } })
  );

  return (
    <Reducer
      active
      name="form"
      state={state}
      updater={setState}
      reductions={{
        isValid: {
          default: true,
          test: false,
          reducers: [REDUCERS.ALL_CHILDREN_VALID],
        },
      }}
      render={() => (
        <>
          <form>
            <Reducer
              name="textInput"
              reductions={{
                isValid: {
                  default: true,
                  test: false,
                  reducers: [REDUCERS.REQUIRED],
                },
              }}
              render={({ getValue, reduce }) => (
                <input
                  data-testid="textInput"
                  type="text"
                  value={getValue()}
                  onChange={(e) => reduce(e.target.value)}
                />
              )}
            />

            <Reducer
              name="numberInput"
              reductions={{
                isValid: {
                  default: true,
                  test: false,
                  reducers: [REDUCERS.REQUIRED, REDUCERS.GREATER_THAN_ZERO],
                },
              }}
              render={({ getValue, reduce }) => (
                <input
                  data-testid="numberInput"
                  type="number"
                  value={getValue()}
                  onChange={(e) => reduce(e.target.value)}
                />
              )}
            />
          </form>

          <div data-testid="state">{JSON.stringify(state)}</div>

          <div data-testid="formValues">
            {JSON.stringify(decodeReducerData(state))}
          </div>
        </>
      )}
    />
  );
};

describe('reducer', async () => {
  it('renders a div', async () => {
    const { getByTestId } = render(<Test />);
    const user = UserEvent.setup();

    const textInput = getByTestId('textInput');
    await user.clear(textInput);
    await user.type(textInput, 'def');

    console.log(
      inspect(JSON.parse(getByTestId('state').innerHTML), false, null)
    );
    console.log(getByTestId('formValues').innerHTML);
  });
});
