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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { readFile } from "node:fs/promises";
import { EOL } from "node:os";
import { join } from "node:path";

import jambitTypedReduxSaga from "@jambit/eslint-plugin-typed-redux-saga";
import jsdoc from "eslint-plugin-jsdoc";
import mocha from "eslint-plugin-mocha";
import notice from "eslint-plugin-notice";
import useEffectNoDeps from "eslint-plugin-use-effect-no-deps";
import workspaces from "eslint-plugin-workspaces";
import { defineConfig, globalIgnores } from "eslint/config";

import { reactStrict } from "@com.mgmtp.a12.devtools/eslint-config";

// this allows eslint to keep finding the template when a sub directory (e.g. core) is opened directly
const licenseHeaderTemplate = await readFile(
	join(import.meta.dirname, "license_header.txt"),
	"utf-8"
);
const licenseHeaderWithInterpreterLine = `#!/usr/bin/env node${EOL}${licenseHeaderTemplate}`;

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
		regex: "@com\\.mgmtp\\.a12\\.(?:widgets/widgets-core)$",
		message:
			"Top-level widgets imports may pull in unwanted dependencies and increase bundle size & compile time. Use the specific subpackage instead."
	},
	{
		regex: "@com\\.mgmtp\\.a12\\.widgets/widgets-core/.*/index\\.js$",
		message:
			"Widgets barrel imports may pull in unwanted dependencies and increase bundle size & compile time. Use the specific subpackage instead."
	},
	{
		regex: "node:assert$",
		message: "Use 'node:assert/strict' instead."
	},
	{
		regex: "node:*",
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

const ignores = [
	"**/.gradle",
	"**/.vscode",
	"**/assets",
	"**/build",
	"**/dist",
	"**/lib",
	"**/resources",
	"**/target",
	"codemod/src/testData",
	"docker",
	"publish",
	"security"
];

export default defineConfig(
	globalIgnores(ignores, "root/ignores"),
	...reactStrict,
	{
		name: "root/base",
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
		plugins: {
			"@jambit/typed-redux-saga": jambitTypedReduxSaga,
			notice,
			workspaces,
			jsdoc,
			useEffectNoDeps
		},
		rules: {
			"@typescript-eslint/consistent-type-exports": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-deprecated": "error",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			eqeqeq: ["error", "smart"],
			"jsdoc/no-undefined-types": "error",
			"notice/notice": [
				"error",
				{
					template: licenseHeaderTemplate,
					onNonMatchingHeader: "replace",
					chars: licenseHeaderTemplate.length,
					messages: {
						whenFailedToMatch: "Missing or incorrect restrictive licence header"
					}
				}
			],
			"no-console": "error",
			"no-inner-declarations": "off",
			"no-restricted-imports": [
				"error",
				{
					patterns: RESTRICTED_IMPORT_PATTERNS
				}
			],
			"react/react-in-jsx-scope": "off",
			"react-hooks/static-components": "off",
			"react-hooks/refs": "off",
			"react-hooks/immutability": "off",
			"require-yield": "off",
			"useEffectNoDeps/use-effect-no-deps": "error",
			"workspaces/no-absolute-imports": "error",
			"workspaces/no-cross-imports": [
				"error",
				{
					allow: ["@com.mgmtp.a12.client/client-core"]
				}
			],
			"workspaces/no-relative-imports": "error",
			"workspaces/require-dependency": "error"
		}
	},
	{
		name: "files-with-license-header-and-interpreter-line",
		files: ["**/cli.ts", "core/scripts/model-deps.ts"],
		rules: {
			"notice/notice": [
				"error",
				{
					template: licenseHeaderWithInterpreterLine,
					onNonMatchingHeader: "replace",
					chars: licenseHeaderWithInterpreterLine.length,
					messages: {
						whenFailedToMatch: "Missing or incorrect restrictive licence header"
					}
				}
			]
		}
	},
	{
		name: "files-with-3rd-party-license",
		files: ["**/3rd-party-licenses/**/*"],
		rules: {
			"notice/notice": "off"
		}
	},
	{
		name: "root/typedReduxSaga",
		files: ["core/src/**/*", "devapp/src/**/*", "documentation/src/main/typescript**/*"],
		ignores: ["core/src/test/**/*", "devapp/src/test/**/*"],
		rules: {
			"@jambit/typed-redux-saga/delegate-effects": "error",
			"@jambit/typed-redux-saga/use-typed-effects": "error"
		}
	},
	{
		name: "testOverrides",
		files: ["core/src/test/**/*", "data/src/test/**/*"],
		plugins: {
			mocha
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"mocha/no-setup-in-describe": "warn"
		}
	},
	{
		name: "core/src/core/specific",
		files: ["core/src/core/**/*"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: CORE_RESTRICTED_IMPORT_PATTERNS
				}
			]
		}
	},
	{
		name: "appmodel-migration/specific",
		files: ["appmodel-migration/**/*.ts"],
		rules: {
			"@typescript-eslint/ban-ts-comment": "off"
		}
	},
	{
		name: "codemod/specific",
		files: ["codemod/src/**/*"],
		rules: {
			"no-console": "off",
			"@typescript-eslint/no-non-null-assertion": "warn",
			"@typescript-eslint/no-unused-expressions": "off"
		}
	},
	{
		name: "documentation/specific",
		files: ["documentation/src/main/typescript/**/*"],
		rules: {
			"@typescript-eslint/no-non-null-assertion": "warn",
			"@typescript-eslint/no-unused-vars": "off"
		}
	},
	{
		name: "cjsScripts/specific",
		files: ["**/*.cjs"],
		rules: {
			"@typescript-eslint/no-require-imports": "off"
		}
	}
);
