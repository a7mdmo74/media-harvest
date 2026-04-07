// Build tools and TypeScript utilities

export const TYPESCRIPT_VERSION = '5.0.0';
export const NODE_TYPES_VERSION = '20.0.0';

// Common TypeScript compiler options
export const baseCompilerOptions = {
  target: 'ES2020',
  lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  allowJs: true,
  skipLibCheck: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  strict: true,
  forceConsistentCasingInFileNames: true,
  moduleResolution: 'node',
  resolveJsonModule: true,
  isolatedModules: true,
  noEmit: true,
  jsx: 'react-jsx',
  declaration: true,
  declarationMap: true,
  sourceMap: true
};

// Export TypeScript version info
export { TYPESCRIPT_VERSION as TS_VERSION, NODE_TYPES_VERSION as NODE_TS_VERSION };
