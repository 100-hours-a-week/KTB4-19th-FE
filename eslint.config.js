import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// FSD 레이어. 앞에 있을수록 상위 레이어이며, 하위 레이어는 상위 레이어를 import할 수 없다.
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const slicedLayers = ['pages', 'widgets', 'features', 'entities'];

function fsdImportRules(layer) {
  const index = layers.indexOf(layer);
  const upperLayers = layers.slice(0, index);
  const patterns = [
    {
      regex: `^@/(${slicedLayers.join('|')})/[^/]+/`,
      message:
        '슬라이스 내부 파일 대신 슬라이스의 public API(index.ts)를 import하세요.',
    },
    {
      regex: '^(\\.\\./){2,}',
      message:
        '슬라이스 밖은 상대 경로 대신 @/ alias와 public API로 import하세요.',
    },
  ];
  if (upperLayers.length > 0) {
    patterns.push({
      regex: `^@/(${upperLayers.join('|')})(/|$)`,
      message: `${layer} 레이어는 상위 레이어(${upperLayers.join(', ')})를 import할 수 없어요.`,
    });
  }
  if (slicedLayers.includes(layer)) {
    patterns.push({
      regex: `^@/${layer}/`,
      message: `같은 레이어(${layer})의 다른 슬라이스는 import할 수 없어요. 공통 부분은 하위 레이어로 내리세요.`,
    });
  }
  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  };
}

export default tseslint.config(
  { ignores: ['node_modules', 'build', '.next', 'dist', 'seed-design'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  ...layers.map(fsdImportRules),
);
