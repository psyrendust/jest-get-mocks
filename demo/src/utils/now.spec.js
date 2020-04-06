const { now } = require('./now');

describe('now', () => {
  it('should return a timestamp', () => {
    expect(now()).toEqual(123456789);
  });
});
