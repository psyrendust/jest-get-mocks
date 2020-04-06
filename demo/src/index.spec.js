const { getFolders, hasFolder } = require('./index');

describe('index', () => {
  describe('getFolders', () => {
    it('should get a list of folder names', () => {
      expect(getFolders('./foo')).toEqual(['aaa', 'bbb', 'ccc']);
    });
  });

  describe('hasFolder', () => {
    it('should return true for a found folder', () => {
      expect(hasFolder('aaa')).toBeTruthy();
    });

    it('should return false for a missing folder', () => {
      expect(hasFolder('bbb')).toBeFalsy();
    });
  });
});
