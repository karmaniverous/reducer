/* eslint-env mocha */

// npm imports
import { render } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

// mocha imports
import chai from 'chai';
chai.should();

// subject imports
import { encodeReducerData } from '../src';

// fixture imports
import TrivialHtmlTestForm from './forms/html/TrivialHtmlTestForm';
// import { inspect } from './fixtures/helpers.mjs';

let getByTestId;
let user;

describe('forms', async () => {
  let decodedStateDiv;
  let encodedStateDiv;

  describe('html', async () => {
    describe('trivial', async () => {
      const initDecodedState = {
        form: { textInput: 'abc', numberInput: '123' },
      };

      let textInput;
      let numberInput;

      beforeEach(async () => {
        ({ getByTestId } = render(
          <TrivialHtmlTestForm initDecodedState={initDecodedState} />
        ));
        user = UserEvent.setup();

        decodedStateDiv = getByTestId('decodedStateDiv');
        encodedStateDiv = getByTestId('encodedStateDiv');

        textInput = getByTestId('textInput');
        numberInput = getByTestId('numberInput');
      });

      it('captures initial decoded state', async () => {
        JSON.parse(decodedStateDiv.innerHTML).should.deep.equal(
          initDecodedState
        );

        JSON.parse(encodedStateDiv.innerHTML).should.deep.equal(
          encodeReducerData(initDecodedState)
        );

        textInput.value.should.equal(initDecodedState.form.textInput);
        numberInput.value.should.equal(initDecodedState.form.numberInput);
      });

      it('fails validation when required field cleared', async () => {
        await user.clear(textInput);

        // console.log(
        //   'decodedStateDiv',
        //   inspect(JSON.parse(decodedStateDiv.innerHTML))
        // );

        JSON.parse(decodedStateDiv.innerHTML).should.deep.equal({
          form: { textInput: '', numberInput: '123' },
        });

        // console.log(
        //   'encodedStateDiv',
        //   inspect(JSON.parse(encodedStateDiv.innerHTML))
        // );

        JSON.parse(encodedStateDiv.innerHTML).should.deep.equal({
          value: {
            form: {
              value: {
                textInput: {
                  value: '',
                  reductions: {
                    isValid: { value: false, context: { label: 'REQUIRED' } },
                  },
                },
                numberInput: { value: '123' },
              },
              reductions: {
                isValid: {
                  value: false,
                  context: { label: 'ALL_CHILDREN_VALID' },
                },
              },
            },
          },
        });

        textInput.value.should.equal('');
        numberInput.value.should.equal(initDecodedState.form.numberInput);
      });
    });
  });
});
