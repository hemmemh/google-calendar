import { FromMillisToDatePipe } from './from-millis-to-date.pipe';

describe('FromMillisToDatePipe', () => {
  it('create an instance', () => {
    const pipe = new FromMillisToDatePipe();
    expect(pipe).toBeTruthy();
  });
});
