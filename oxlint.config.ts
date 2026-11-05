/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { defineConfig } from "oxlint";

const RESTRICTED_IMPORT_PATTERNS = [
	{
		group: ["@com.mgmtp.a12.*/**/internal/**"],
		message:
			"A12 Code should always be imported via the its public API. If this is not possible, please disable the rule inline and add a comment."
	},
	{
		group: ["@com.mgmtp.a12.*/**/src/**"],
		message:
			"Importing A12 Code directly from source is most likely a mistake. Import from `lib` instead."
	},
	{
		group: ["**/test/**"],
		message: "Importing A12 Code from the /test directory is not allowed."
	},
	{
		regex: "node:assert$",
		message: "Use 'node:assert/strict' instead."
	},
	{
		regex: "^node:(?!process)",
		importNames: ["*", "default"],
		message: "Use the specific named exports instead."
	},
	{
		group: ["redux-saga"],
		importNames: ["SagaIterator"],
		message: "Use 'SagaGenerator' from 'typed-redux-saga' instead."
	}
];

const CORE_RESTRICTED_IMPORT_PATTERNS = [
	...RESTRICTED_IMPORT_PATTERNS,
	{
		group: ["**/extensions/**"],
		message: "A dependency from core to extensions is not allowed."
	}
];

/**
 * Every rule is listed explicitly and all categories are off, so an oxlint upgrade cannot change
 * what we enforce.
 *
 * Formatting is oxfmt's job, including import order (`sortImports` in oxfmt.config.ts).
 * Without an oxlint equivalent, and unreplaced: `jsdoc/no-undefined-types` and
 * `react/no-deprecated` - for the latter, `typescript/no-deprecated` reports the same APIs from
 * the `@types/react` annotations.
 */
export default defineConfig({
	plugins: ["typescript", "import", "unicorn", "react"],
	jsPlugins: [
		{ name: "header", specifier: "@tony.ganchev/eslint-plugin-header" },
		{ name: "workspaces", specifier: "eslint-plugin-workspaces" },
		{ name: "typedReduxSaga", specifier: "@jambit/eslint-plugin-typed-redux-saga" },
		{ name: "useEffectNoDeps", specifier: "eslint-plugin-use-effect-no-deps" }
	],
	categories: {
		correctness: "off",
		suspicious: "off",
		pedantic: "off",
		perf: "off",
		style: "off",
		restriction: "off",
		nursery: "off"
	},
	env: { builtin: true },
	options: {
		typeAware: true,
		reportUnusedDisableDirectives: "error"
	},
	ignorePatterns: [
		".gradle",
		// The callable scripts are built by the A12 Business Scripting toolchain against its own
		// globals, and `scripting-devapp/eslint.config.ts` kept them out of the ESLint run too.
		"scripting-devapp/server-scripts",
		".vscode",
		"assets",
		"build",
		"dist",
		"lib",
		"node_modules",
		"resources",
		"target",
		"testData",
		"worktrees",
		"licenses",
		"THIRD_PARTY_NOTICES"
	],
	rules: {
		"curly": "error",
		"eqeqeq": ["error", "smart"],
		"for-direction": "error",
		"no-array-constructor": "error",
		"no-async-promise-executor": "error",
		"no-case-declarations": "error",
		"no-compare-neg-zero": "error",
		"no-cond-assign": "error",
		"no-console": "error",
		"no-constant-binary-expression": "error",
		"no-constant-condition": "error",
		"no-control-regex": "error",
		"no-debugger": "error",
		"no-delete-var": "error",
		"no-dupe-else-if": "error",
		"no-duplicate-case": "error",
		"no-empty": "error",
		"no-empty-character-class": "error",
		"no-empty-pattern": "error",
		"no-empty-static-block": "error",
		"no-ex-assign": "error",
		"no-extra-boolean-cast": "error",
		"no-fallthrough": "error",
		"no-global-assign": "error",
		"no-invalid-regexp": "error",
		"no-irregular-whitespace": "error",
		"no-loss-of-precision": "error",
		"no-misleading-character-class": "error",
		"no-nonoctal-decimal-escape": "error",
		"no-prototype-builtins": "error",
		"no-regex-spaces": "error",
		"no-restricted-imports": ["error", { "patterns": RESTRICTED_IMPORT_PATTERNS }],
		"no-self-assign": "error",
		"no-shadow-restricted-names": "error",
		"no-sparse-arrays": "error",
		"no-unassigned-vars": "error",
		"no-unexpected-multiline": "error",
		"no-unsafe-finally": "error",
		"no-unsafe-optional-chaining": "error",
		"no-unused-expressions": "error",
		"no-unused-labels": "error",
		"no-unused-private-class-members": "error",
		"no-unused-vars": [
			"error",
			{
				"args": "all",
				"argsIgnorePattern": "^_",
				"caughtErrors": "all",
				"caughtErrorsIgnorePattern": "^_",
				"destructuredArrayIgnorePattern": "^_",
				"varsIgnorePattern": "^_",
				"ignoreRestSiblings": true
			}
		],
		"no-useless-assignment": "error",
		"no-useless-backreference": "error",
		"no-useless-catch": "error",
		"no-useless-constructor": "error",
		"no-useless-escape": "error",
		"no-var": "error",
		"prefer-const": "error",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"preserve-caught-error": "error",
		"require-yield": "off",
		"use-isnan": "error",
		"valid-typeof": "error",
		"import/newline-after-import": ["error", { "count": 1 }],
		"react/error-boundaries": "error",
		"react/exhaustive-deps": "error",
		"react/globals": "error",
		"react/immutability": "error",
		"react/incompatible-library": "warn",
		"react/jsx-key": "error",
		"react/jsx-no-comment-textnodes": "error",
		"react/jsx-no-duplicate-props": "error",
		"react/jsx-no-target-blank": "error",
		"react/jsx-no-undef": "error",
		"react/no-children-prop": "error",
		"react/no-danger-with-children": "error",
		"react/no-direct-mutation-state": "error",
		"react/no-find-dom-node": "error",
		"react/no-is-mounted": "error",
		"react/no-render-return-value": "error",
		"react/no-string-refs": "error",
		"react/no-unescaped-entities": "error",
		"react/no-unknown-property": "error",
		"react/preserve-manual-memoization": "error",
		"react/purity": "error",
		"react/react-in-jsx-scope": "off",
		"react/refs": "error",
		"react/require-render-return": "error",
		"react/rules-of-hooks": "error",
		"react/set-state-in-effect": "error",
		"react/set-state-in-render": "error",
		"react/static-components": "off",
		"react/unsupported-syntax": "warn",
		"react/use-memo": "error",
		"typescript/ban-ts-comment": ["error", { "minimumDescriptionLength": 10 }],
		"typescript/consistent-type-exports": "error",
		"typescript/consistent-type-imports": "error",
		"typescript/no-deprecated": "error",
		"typescript/no-duplicate-enum-values": "error",
		"typescript/no-dynamic-delete": "error",
		"typescript/no-empty-object-type": "off",
		"typescript/no-explicit-any": "error",
		"typescript/no-extra-non-null-assertion": "error",
		"typescript/no-extraneous-class": "error",
		// node:test's suite functions return a promise the runner itself awaits
		"typescript/no-invalid-void-type": "error",
		"typescript/no-misused-new": "error",
		"typescript/no-non-null-asserted-nullish-coalescing": "error",
		"typescript/no-non-null-asserted-optional-chain": "error",
		"typescript/no-non-null-assertion": "error",
		"typescript/no-require-imports": "error",
		"typescript/no-this-alias": "error",
		"typescript/no-unnecessary-type-constraint": "error",
		"typescript/no-unsafe-declaration-merging": "error",
		"typescript/no-unsafe-function-type": "error",
		"typescript/no-wrapper-object-types": "error",
		"typescript/prefer-as-const": "error",
		"typescript/prefer-literal-enum-member": "error",
		"typescript/prefer-namespace-keyword": "error",
		"typescript/triple-slash-reference": "error",
		"typescript/unified-signatures": "error",
		"header/header": ["error", { "header": { "file": "./license_header.txt" } }],
		"workspaces/no-absolute-imports": "error",
		"workspaces/no-cross-imports": [
			"error",
			{
				"allow": [
					"@com.mgmtp.a12.client/client-core",
					"@com.mgmtp.a12.client/client-scripting"
				]
			}
		],
		"workspaces/no-relative-imports": "error",
		"workspaces/require-dependency": "error",
		"useEffectNoDeps/use-effect-no-deps": "error"
	},
	overrides: [
		{
			files: ["**/*.cjs"],
			rules: {
				"typescript/no-require-imports": "off"
			}
		},
		{
			files: ["**/3rd-party-licenses/**"],
			rules: {
				"header/header": "off"
			}
		},
		{
			files: ["appmodel-migration/**/*.ts"],
			rules: {
				"typescript/ban-ts-comment": "off"
			}
		},
		{
			files: ["codemod/src/**"],
			rules: {
				"no-console": "off",
				"no-unused-expressions": "off",
				"typescript/no-non-null-assertion": "warn"
			}
		},
		{
			files: [
				"core/src/**",
				"devapp/src/**",
				"documentation/src/main/typescript/**",
				"scripting/src/**",
				"scripting-devapp/src/**"
			],
			rules: {
				"typedReduxSaga/delegate-effects": "error",
				"typedReduxSaga/use-typed-effects": "error"
			}
		},
		{
			files: ["core/src/core/**"],
			rules: {
				"no-restricted-imports": ["error", { "patterns": CORE_RESTRICTED_IMPORT_PATTERNS }]
			}
		},
		{
			files: ["scripting/**", "scripting-devapp/**"],
			rules: {
				"header/header": "off"
			}
		},
		{
			files: ["scripting-devapp/src/**"],
			excludeFiles: ["scripting-devapp/src/example.scripts/**"],
			rules: {
				"typescript/no-import-type-side-effects": "error",
				"no-restricted-imports": [
					"error",
					{
						"patterns": [
							{
								group: ["**/example.scripts/**"],
								allowTypeImports: true,
								message:
									"A script is deployed as its own module and imported by the invocation worker. The application may import a script module for its types only."
							}
						]
					}
				]
			}
		},
		{
			files: ["scripting-devapp/src/**"],
			rules: {
				"react/immutability": "error",
				"react/refs": "error",
				"typescript/no-unnecessary-condition": "error"
			}
		},
		{
			files: ["devapp/src/devapp/**"],
			rules: {
				"react/immutability": "error",
				"react/refs": "error",
				"typescript/no-unnecessary-condition": "error"
			}
		},
		{
			files: ["documentation/src/main/typescript/**"],
			rules: {
				"no-unused-vars": "off",
				"react/immutability": "error",
				"react/refs": "error",
				"typescript/no-non-null-assertion": "warn",
				"typescript/no-unnecessary-condition": "error"
			}
		},
		{
			files: ["core/src/test/**", "data/src/test/**", "scripting/src/test/**"],
			rules: {
				"no-unused-expressions": "off",
				"no-unused-vars": "off",
				"react/immutability": "warn",
				"react/refs": "warn",
				"typedReduxSaga/delegate-effects": "off",
				"typedReduxSaga/use-typed-effects": "off",
				"typescript/no-explicit-any": "off",
				"typescript/no-non-null-assertion": "off"
			}
		}
	]
});
