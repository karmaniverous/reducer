/* eslint-env mocha */

import { render } from '@testing-library/react';

import chai from 'chai';
chai.should();

describe('reducer', () => {
  it('renders a div', () => {
    const { asFragment, getByText } = render(<div>Hello, world!</div>);
    console.log(getByText('Hello, world!'));
    console.log(asFragment());
    true.should.be.ok;
  });
});
