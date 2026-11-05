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
 * Graph-only config: extends the main validation config but tweaks what is
 * drawn so the diagram stays readable:
 * - the graph is collapsed to one node per component (validation itself runs
 *   un-collapsed, see the note in dependency-cruiser.js).
 * - configurationNG is excluded while that module still has unresolved cycles.
 * - src/core/index.ts (the package's public barrel entry point) is excluded
 *   because it imports from everywhere, adding noise without insight.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
export default {
	extends: "./dependency-cruiser.js",
	options: {
		collapse: "^src/(core|extensions)/[^/]+",
		exclude: {
			path: "\\.(test|spec)\\.(ts|tsx)$|/__tests__/|^src/test/|^src/core/configurationNG/|^src/core/index\\.ts$"
		}
	}
};
