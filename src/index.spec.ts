import path from 'path';

import {
  assignMocks,
  defaultExcludeFiles,
  defaultModuleFileExtensions,
  filterSrcMocks,
  flatten,
  getGlobalMocks,
  getMockFiles,
  getRelativeMocks,
  jestGetMocks,
  makeModulePairs,
  makeRelativePairs,
} from '.';

type MultiDimensionalArray<S> = (S | MultiDimensionalArray<S>)[];
type MockFilesArray = MultiDimensionalArray<string>;

const rootDir = path.resolve(process.cwd(), 'demo');
const srcDir = path.resolve(rootDir, 'src');
const globalMocksDir = path.resolve(srcDir, '__mocks__');

function cleanRootDir(files: MockFilesArray): MockFilesArray {
  return files.map(file => {
    if (Array.isArray(file)) {
      return cleanRootDir(file);
    }
    return file.replace(`${rootDir}/`, '');
  });
}

describe('getMockFiles', () => {
  it('should return a MockPairs object', () => {
    expect(cleanRootDir(getMockFiles(srcDir))).toMatchSnapshot();
  });
});

describe('flatten', () => {
  it('should flatten a multi-dimensional array', () => {
    expect(flatten(['a', 'b', ['c', 'd', ['e', 'f'], 'g'], 'h'], [])).toMatchSnapshot();
  });
});

describe('filterSrcMocks', () => {
  const options = {
    excludeFiles: defaultExcludeFiles,
    moduleFileExtensions: defaultModuleFileExtensions,
  };

  it('should return false for filepaths that match', () => {
    expect(filterSrcMocks(rootDir, `${rootDir}/__mocks__/foo.js`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/spec.js`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/spec.jsx`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/spec.ts`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/spec.tsx`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/snap`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/jest.setup.js`, options)).toBeFalsy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/jest.setup.ts`, options)).toBeFalsy();
  });

  it('should return true for filepaths that match', () => {
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/__mocks__/foo.js`, options)).toBeTruthy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/__mocks__/foo.jsx`, options)).toBeTruthy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/__mocks__/foo.ts`, options)).toBeTruthy();
    expect(filterSrcMocks(rootDir, `${rootDir}/a/b/__mocks__/foo.tsx`, options)).toBeTruthy();
  });
});

describe('makeModulePairs', () => {
  it('should return a MockPairs object of global modules', () => {
    const filepaths = ['/demo/src/__mocks__/fs.js', '/demo/src/__mocks__/uuid.js'];
    const results = filepaths.reduce(
      (acc, filepath) => makeModulePairs('/demo', '/demo/src/__mocks__', acc, filepath),
      {}
    );
    expect(results).toMatchSnapshot();
  });
});

describe('makeRelativePairs', () => {
  it('should return a MockPairs object of relative modules', () => {
    const filepaths = [
      '/demo/src/index.js',
      '/demo/src/index.spec.js',
      '/demo/src/utils/__mocks__/now.ts',
      '/demo/src/utils/get-id.js',
      '/demo/src/utils/get-id.spec.js',
      '/demo/src/utils/now.js',
      '/demo/src/utils/now.spec.js',
    ];
    const results = filepaths.reduce((acc, filepath) => makeRelativePairs('/demo', '/demo/src', acc, filepath), {});
    expect(results).toMatchSnapshot();
  });
});

describe('getGlobalMocks', () => {
  it('should return a MockPairs object of global modules', () => {
    expect(getGlobalMocks(rootDir, globalMocksDir)).toMatchSnapshot();
  });
});

describe('getRelativeMocks', () => {
  it('should return a MockPairs object of relative modules', () => {
    expect(getRelativeMocks(rootDir, srcDir)).toMatchSnapshot();
  });

  it('should return an empty MockPairs object with wrong moduleFileExtension', () => {
    expect(
      getRelativeMocks(rootDir, srcDir, {
        moduleFileExtensions: ['.ts'],
      })
    ).toMatchSnapshot();
  });

  it('should return an empty MockPairs object with wrong excludeFiles', () => {
    expect(
      getRelativeMocks(rootDir, srcDir, {
        excludeFiles: ['.js'],
      })
    ).toMatchSnapshot();
  });
});

describe('assignMocks', () => {
  let consoleOutput: string[] = [];
  const originalWarn = console.warn;
  const mockedWarn = (output: string): void => {
    consoleOutput.push(output);
  };

  afterEach(() => {
    console.warn = originalWarn;
    consoleOutput = [];
  });

  beforeEach(() => {
    console.warn = mockedWarn;
  });

  it('should overwrite the destination', () => {
    const destination = {
      a: 'aaa',
      b: 'bbb',
    };
    const source1 = {
      c: 'ccc',
      d: 'ddd',
    };
    expect(assignMocks(destination, source1)).toMatchSnapshot();
  });

  it('should warn if overwriting the destination', () => {
    const destination = {
      a: 'aaa',
      b: 'bbb',
    };
    const source1 = {
      b: 'bbbbbb',
      c: 'ccc',
      d: 'ddd',
    };
    expect(assignMocks(destination, source1)).toMatchSnapshot();
    expect(consoleOutput).toEqual(['Overriding existing package b in destination.']);
  });

  it('should returned an assigned object', () => {
    const source1 = {
      a: 'aaa',
      b: 'bbb',
    };
    const source2 = {
      b: 'bbbbbb',
      c: 'ccc',
      d: 'ddd',
    };
    expect(assignMocks({}, source1, source2)).toMatchSnapshot();
    expect(consoleOutput).toEqual([]);
  });
});

describe('jestGetMocks', () => {
  it('should return a MockPairs object with globals', () => {
    expect(
      jestGetMocks({
        globalMocksDir,
        rootDir,
        srcDir,
      })
    ).toMatchSnapshot();
  });

  it('should return a MockPairs object without globals', () => {
    expect(
      jestGetMocks({
        rootDir,
        srcDir,
      })
    ).toMatchSnapshot();
  });
});
