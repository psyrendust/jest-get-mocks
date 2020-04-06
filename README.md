# jest-get-mocks

Recursively find mocks in your source code for your projects Jest config. Returns a flattened object of absolute (global
mocks) and relative path `key`:`value` (`<module_name>`:`<mock_function_path>` pairs by searching a directory for mock
functions. For global mocks, found folders will be recursively searched and treated as scoped modules. For relative
mocks, found folders will be recursively searched for `__mocks__` folders.

> Note: For relative mocks, excludes `<rootDir>/src/__mocks__`, but includes `<rootDir>/src/ ** /__mocks__/ *`.

## Install

Using NPM

```bash
$ npm install --save-dev jest-get-mocks
```

Using Yarn

```bash
$ yarn add --dev jest-get-mocks
```

## Usage

Import the package then apply the results to your `moduleNameMapper` field in your jest
configuration.

```js
const jestGetMocks = require('jest-get-mocks');
const path = require('path');

const mocks = jestGetMocks({
  /** The directory for your global/module mocks (optional). */
  globalMocksDir: path.resolve(__dirname, 'src/__mocks__'),
  /** The project root directory. Typically where your jest.config.js is. */
  rootDir: path.resolve(__dirname),
  /** The projects source directory. */
  srcDir: path.resolve(__dirname, 'src'),
    /**
   * File names to exclude, can be partial names.
   * Defaults to `['spec.js', 'spec.jsx', 'spec.ts', 'spec.tsx', 'snap', 'jest.setup.js', 'jest.setup.ts']`.
   */
  excludeFiles: ['spec.js', 'spec.jsx', 'spec.ts', 'spec.tsx', 'snap', 'jest.setup.js', 'jest.setup.ts'];
  /**
   * An array of file extensions your modules use.
   * Defaults to `['js', 'jsx', 'ts', 'tsx']`;
   */
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'];
});

module.exports = {
  moduleNameMapper: {
    ...mocks,
  },
};
```

If you run the example in the `./demo` folder your `moduleNameMapper` will look like the following:

```js
module.exports = {
  moduleNameMapper: {
    fs: '<rootDir>/src/__mocks__/fs',
    uuid: '<rootDir>/src/__mocks__/uuid',
    '\\/now$': '<rootDir>/src/utils/__mocks__/now',
  },
};
```

## Contributing

Run, `yarn lint && yarn test`
