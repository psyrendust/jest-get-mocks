const { getId } = require('./get-id');

describe('getId', () => {
  it('should return a UUID', () => {
    expect(getId()).toEqual('abc123xyz');
  });
});
