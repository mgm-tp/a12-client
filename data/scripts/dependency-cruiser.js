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

/**
 * Replaces the former `devtools detect-cycles` check. That check ran over every
 * file without `--ignore-type-imports`, so type-only imports counted too; the
 * `tsPreCompilationDeps` option below preserves exactly that strictness.
 *
 * Unlike `core`, this package has no frozen list of allowed cross-area edges yet
 * — `data` is smaller and its layering is not settled. Cycles are the contract
 * we enforce here.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
export default {
	forbidden: [
		{
			name: "no-circular",
			comment: "Areas (and modules) must form a DAG.",
			severity: "error",
			from: {},
			to: { circular: true }
		},
		{
			name: "no-orphans",
			comment:
				"Dead modules — remove or wire up. NOTE: rules are evaluated on the " +
				"un-collapsed graph, but the reporter applies `options.collapse`, so the " +
				"warning names the *area* (e.g. src/redux), not the dead file inside it. " +
				"To locate the file, re-run with `collapse` removed from the options below.",
			severity: "warn",
			from: { orphan: true, pathNot: "\\.d\\.ts$|index\\.(ts|tsx)$" },
			to: {}
		}
	],
	options: {
		tsConfig: { fileName: "tsconfig.json" },
		tsPreCompilationDeps: true,
		includeOnly: "^src/",
		doNotFollow: { path: "node_modules" },
		exclude: { path: "\\.(test|spec)\\.(ts|tsx)$|/__tests__/|^src/test/" },
		collapse: "^src/[^/]+"
	}
};
