import fs from 'fs';
import path from 'path';

export type AssignMocksDestination = { [key: string]: string };
export type MockPairs = { [key: string]: string };
export type MultiDimensionalArray<S> = (S | MultiDimensionalArray<S>)[];
export type FlattenAcc = MultiDimensionalArray<string>;
export type MockFilesArray = MultiDimensionalArray<string>;

export type FilterSrcMocksOptions = {
  /**
   * File names to exclude, can be partial names.
   * Defaults to `['spec.js', 'spec.jsx', 'spec.ts', 'spec.tsx', 'snap', 'jest.setup.js', 'jest.setup.ts']`.
   */
  excludeFiles: string[];
  /**
   * An array of file extensions your modules use.
   * Defaults to `['js', 'jsx', 'ts', 'tsx']`;
   */
  moduleFileExtensions: string[];
};

export type GetMocksOptions = {
  /** The directory for your global/module mocks. */
  globalMocksDir?: string;
  /** The project root directory. Typically where your jest.config.js is. */
  rootDir: string;
  /** The projects source directory. */
  srcDir: string;
  /**
   * File names to exclude, can be partial names.
   * Defaults to `['spec.js', 'spec.jsx', 'spec.ts', 'spec.tsx', 'snap', 'jest.setup.js', 'jest.setup.ts']`.
   */
  excludeFiles?: string[];
  /**
   * An array of file extensions your modules use.
   * Defaults to `['js', 'jsx', 'ts', 'tsx']`;
   */
  moduleFileExtensions?: string[];
};

export const defaultExcludeFiles = [
  'spec.js',
  'spec.jsx',
  'spec.ts',
  'spec.tsx',
  'snap',
  'jest.setup.js',
  'jest.setup.ts',
];
export const defaultModuleFileExtensions = ['js', 'jsx', 'ts', 'tsx'];

/**
 * Returns a multi-dimensional array of mock filepaths by searching a directory
 * for mock functions. Found folders will be recursively searched and treated as
 * scoped modules.
 * @param filepath The file path to recursively search for mocks.
 * @returns A multi-dimensional array of mock filepaths.
 */
export function getMockFiles(filepath: string): MockFilesArray {
  const items: string[] = fs.readdirSync(filepath);
  return items.map((name: string) => {
    const childpath = path.join(filepath, name);
    if (fs.lstatSync(childpath).isDirectory()) {
      return getMockFiles(childpath);
    }

    return childpath;
  });
}
/**
 * Function that recursively flattens an array of mock filepaths.
 * @param array The multi-dimensional array to flatten.
 * @param filepath The mocks filepath.
 * @return Flattened array of mock filepaths.
 *
 * ```js
 * const data = ['a', 'b', ['c', 'd', ['e', 'f'], 'g'], 'h'];
 * flatten(data, []); // returns ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
 * ```
 */
export function flatten<T = string>(array: MultiDimensionalArray<T>, result: T[]): T[] {
  const len = array.length;
  for (let i = 0; i < len; i += 1) {
    const value = array[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

/**
 * Function that filters out filepaths that are not considered relative manual mocks.
 * @param mocksRootDir The root file path.
 * @param filepath The filepath to filter.
 * @param options The options for the filter.
 */
export function filterSrcMocks(mocksRootDir: string, filepath: string, options: FilterSrcMocksOptions): boolean {
  const srcMocks = path.join(mocksRootDir, '__mocks__');
  if (filepath.startsWith(srcMocks)) {
    return false;
  }
  if (options.excludeFiles.some((extname: string) => filepath.endsWith(extname))) {
    return false;
  }
  if (options.moduleFileExtensions.some((extname: string) => filepath.endsWith(extname))) {
    const folderName = path.basename(path.dirname(filepath));
    if (folderName === '__mocks__') {
      return true;
    }
  }
  return false;
}

/**
 * Function that returns an object of package names and the location of their mock functions.
 * @param rootDir The jest rootDir.
 * @param mocksRootDir The file path to recursively search for mocks.
 * @param acc The accumulator.
 * @param filepath The mocks filepath.
 * @returns An object of package names and the location of their mock functions.
 *
 * ```json
 * {
 *     "<package-name>": "<rootDir>/src/<mock-location>",
 *     "@namespace/not-found": "<rootDir>/src/__mocks__/@namespace/not-found"
 * };
 * ```
 */
export function makeModulePairs(rootDir: string, mocksRootDir: string, acc: MockPairs, filepath: string): MockPairs {
  const indexReg = new RegExp(`${path.sep}index$`, 'i');
  const extname = path.extname(filepath);
  const prettyPath = filepath.replace(extname, '');
  const pkgName = prettyPath.replace(`${mocksRootDir}${path.sep}`, '').replace(indexReg, '');
  const pkgPath = prettyPath.replace(rootDir, '<rootDir>');
  acc[pkgName] = pkgPath;
  return acc;
}

/**
 * Function that returns an object of relative package names and the location of their mock
 * functions.
 * @param rootDir The jest rootDir.
 * @param mocksRootDir The file path to recursively search for mocks.
 * @param acc The accumulator.
 * @param filepath The mocks filepath.
 * @returns An object of relative package names and the location of their mock functions.
 *
 * ```json
 * {
 *     "\\/<package-name>": "<rootDir>/src/<mock-location>",
 *     "\\/resourceLoaderUtils": "<rootDir>/src/foo/bar/__mocks__/resourceLoaderUtils"
 * };
 * ```
 */
export function makeRelativePairs(rootDir: string, mocksRootDir: string, acc: MockPairs, filepath: string): MockPairs {
  const extname = path.extname(filepath);
  const prettyPath = filepath.replace(extname, '');
  const pkgName = prettyPath.replace(`${mocksRootDir}${path.sep}`, '');
  const pkgPath = prettyPath.replace(rootDir, '<rootDir>');
  const relativePkgName = path.basename(pkgName);
  acc[`\\/${relativePkgName}$`] = pkgPath;
  return acc;
}

/**
 * Returns a flattened object of absolute path key/value (<module_name>/<mock_function_path>) pairs
 * by searching a directory for mock functions. Found folders will be recursively searched and
 * treated as scoped modules.
 * @param rootDir The jest rootDir.
 * @param mocksRootDir The file path to recursively search for mocks.
 * @returns A flattened object of absolute path key/value (<module_name>/<mock_function_path>) pairs.
 */
export function getGlobalMocks(rootDir: string, mocksRootDir: string): MockPairs {
  const flattened = flatten<string>(getMockFiles(mocksRootDir), []);
  return flattened.reduce(
    (acc: MockPairs, filepath: string) => makeModulePairs(rootDir, mocksRootDir, acc, filepath),
    {}
  );
}

/**
 * Returns a flattened object of relative path key/value (<module_name>/<mock_function_path>) pairs
 * by searching a directory for mock functions. Found folders will be recursively searched for
 * `__mocks__` folders.
 * > Note: Excludes `<rootDir>/src/__mocks__`, but includes `<rootDir>/src/ ** /__mocks__/ *`.
 * @param rootDir The jest rootDir.
 * @param mocksRootDir The file path to recursively search for mocks.
 * @param options The optional options to pass along to `filterSrcMocks`.
 * @returns A flattened object of relative path key/value (<module_name>/<mock_function_path>) pairs.
 */
export function getRelativeMocks(
  rootDir: string,
  mocksRootDir: string,
  options?: Partial<FilterSrcMocksOptions>
): MockPairs {
  const flattened = flatten<string>(getMockFiles(mocksRootDir), []);
  const filterSrcMocksOptions = {
    excludeFiles: options?.excludeFiles ?? defaultExcludeFiles,
    moduleFileExtensions: options?.moduleFileExtensions ?? defaultModuleFileExtensions,
  };
  return flattened
    .filter((filepath: string) => filterSrcMocks(mocksRootDir, filepath, filterSrcMocksOptions))
    .reduce((acc, filepath) => makeRelativePairs(rootDir, mocksRootDir, acc, filepath), {});
}

/**
 * Override existing mocks by assigning own enumerable string keyed properties of source objects to
 * the `destination` object. Source objects are applied from left to right. Subsequent sources
 * overwrite property assignments of previous sources.
 * > Note: This method mutates `destination` and is loosely based on Object.assign.
 * @param destination The destination object.
 * @param sources The source moduleNameMapper objects.
 * @returns An object of absolute and relative package names as keys with the location of their mock
 *   functions as the value.
 *
 * ```js
 * config
 * {
 *   "moduleNameMapper": {
 *     "uuid": "<rootDir>/src/__mocks__/uuid",
 *     "\\/now$": "<rootDir>/src/core/utils/__mocks__/now"
 *   }
 * }
 */
export function assignMocks(destination: AssignMocksDestination, ...sources: MockPairs[]): MockPairs {
  const origin = { ...destination };
  sources.forEach((mocks: MockPairs) => {
    Object.keys(mocks).forEach((pkgName: string) => {
      // Warn the user they are override existing mocks in the destination.
      if (Object.prototype.hasOwnProperty.call(origin, pkgName)) {
        console.warn(`Overriding existing package ${pkgName} in destination.`);
      }
      destination[pkgName] = mocks[pkgName];
    });
  });
  return destination;
}

/**
 * Returns a flattened object of absolute (global mocks) and relative path key/value
 * (`<module_name>`/`<mock_function_path>`) pairs by searching a directory for mock functions.
 * For global mocks, found folders will be recursively searched and treated as scoped modules.
 * For relative mocks, found folders will be recursively searched for `__mocks__` folders.
 * > Note: For relative mocks, excludes `<rootDir>/src/__mocks__`, but includes `<rootDir>/src/ ** /__mocks__/ *`.
 */
export function jestGetMocks(options: GetMocksOptions): MockPairs {
  let globalMocks = {};
  if (options.globalMocksDir && fs.existsSync(options.globalMocksDir)) {
    globalMocks = getGlobalMocks(options.rootDir, options.globalMocksDir);
  }
  const relativeMocks = getRelativeMocks(options.rootDir, options.srcDir, options);
  return assignMocks({}, globalMocks, relativeMocks);
}
