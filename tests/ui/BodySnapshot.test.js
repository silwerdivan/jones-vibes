import fs from 'fs';
import path from 'path';

describe('Body Snapshot', () => {
  beforeAll(async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    document.body.innerHTML = html.toString();
    
    await import('../../js/app.js');

    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  });

  test('Body should match snapshot', () => {
    expect(document.body.innerHTML).toMatchSnapshot();
  });
});
