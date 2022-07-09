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
import SimpleHtmlTestForm from './forms/html/SimpleHtmlTestForm';
import CompositeHtmlTestForm from './forms/html/composite/CompositeHtmlTestForm';
import DeepHtmlTestForm from './forms/html/DeepHtmlTestForm';
// import { inspect } from './fixtures/helpers.mjs';

let getByTestId;
let user;

describe('forms', async () => {
  let decodedStateDiv;
  let encodedStateDiv;

  let initDecodedState;
  let clearTextInputDecodedState;
  let clearTextInputEncodedState;

  describe('html', async () => {
    beforeEach(async () => {
      initDecodedState = {
        form: { textInput: 'abc', numberInput: '123' },
      };

      clearTextInputDecodedState = {
        form: { textInput: '', numberInput: '123' },
      };

      clearTextInputEncodedState = {
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
      };
    });

    let textInput;
    let numberInput;

    describe('simple', async () => {
      beforeEach(async () => {
        ({ getByTestId } = render(
          <SimpleHtmlTestForm initDecodedState={initDecodedState} />
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

        JSON.parse(decodedStateDiv.innerHTML).should.deep.equal(
          clearTextInputDecodedState
        );

        JSON.parse(encodedStateDiv.innerHTML).should.deep.equal(
          clearTextInputEncodedState
        );

        textInput.value.should.equal('');
        numberInput.value.should.equal(initDecodedState.form.numberInput);
      });
    });

    describe('composite', async () => {
      beforeEach(async () => {
        ({ getByTestId } = render(
          <CompositeHtmlTestForm initDecodedState={initDecodedState} />
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

        JSON.parse(decodedStateDiv.innerHTML).should.deep.equal(
          clearTextInputDecodedState
        );

        JSON.parse(encodedStateDiv.innerHTML).should.deep.equal(
          clearTextInputEncodedState
        );

        textInput.value.should.equal('');
        numberInput.value.should.equal(initDecodedState.form.numberInput);
      });
    });

    describe('deep', async () => {
      initDecodedState = {
        form: {
          sectionA: { textInput: 'abc', numberInput: '123' },
          sectionB: { textInput: 'def', numberInput: '456' },
        },
      };

      let textInputA;
      let textInputB;
      let numberInputA;
      let numberInputB;

      beforeEach(async () => {
        ({ getByTestId } = render(
          <DeepHtmlTestForm initDecodedState={initDecodedState} />
        ));

        textInputA = getByTestId('textInputA');
        numberInputA = getByTestId('numberInputA');

        textInputB = getByTestId('textInputB');
        numberInputB = getByTestId('numberInputB');
      });

      it('passes context correctly', async () => {
        textInputA.disabled.should.equal(false);
        numberInputA.disabled.should.equal(false);

        textInputB.disabled.should.equal(true);
        numberInputB.disabled.should.equal(true);
      });
    });
  });
});
