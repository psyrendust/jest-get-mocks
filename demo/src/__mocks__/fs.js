const existsSync = jest.fn(dir => dir === 'aaa');
const readdirSync = jest.fn(() => ['aaa', 'bbb', 'ccc']);

module.exports = {
  existsSync,
  readdirSync,
};
