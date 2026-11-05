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

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
	forbidden: [
		{
			name: "no-circular",
			comment: "Components (and modules) must form a DAG.",
			severity: "error",
			from: {},
			// Match every cycle EXCEPT those routed through configurationNG.
			// viaOnly.pathNot matches a cycle only when NONE of its members
			// satisfy the regex, so configurationNG cycles fall through to the
			// rule below instead of failing the build here.
			to: { circular: true, viaOnly: { pathNot: "^src/core/configurationNG/" } }
		},
		{
			name: "no-circular-configurationNG",
			comment:
				"KNOWN DEBT: cycles routed through src/core/configurationNG are not " +
				"easily fixable architecturally yet. We still want them surfaced, so " +
				"they are reported as warnings (no build failure) until untangled — " +
				"`node --run cycles`, since validate:cycles silences them. " +
				"via.path matches any cycle that includes at least one configurationNG module.",
			severity: "warn",
			from: {},
			to: { circular: true, via: { path: "^src/core/configurationNG/" } }
		},
		{
			name: "core-not-to-extensions",
			comment: "Layering law: core may never depend on extensions.",
			severity: "error",
			from: { path: "^src/core/" },
			to: { path: "^src/extensions/" }
		},
		{
			name: "no-orphans",
			comment: "Dead modules — remove or wire up.",
			severity: "warn",
			from: { orphan: true, pathNot: "\\.d\\.ts$|index\\.(ts|tsx)$" },
			to: {}
		}
	],
	allowedSeverity: "error",
	allowed: [
		// intra-component imports are always fine
		{
			from: { path: "^src/(core|extensions)/([^/]+)/" },
			to: { path: "^src/$1/$2/" }
		},
		// shared root files (src/core/*.ts: utils, lenses, assertion, ClientWidgetMap, index)
		// may be imported by anyone ...
		{
			from: {},
			to: { path: "^src/core/[^/]+\\.(ts|tsx)$" }
		},
		// ... and may themselves import any core component (they are the barrel/shared layer)
		{
			from: { path: "^src/core/[^/]+\\.(ts|tsx)$" },
			to: { path: "^src/core/" }
		},

		// ---- allowed module edges, updating this should be done carefully ----
		{
			from: { path: "^src/core/activity/" },
			to: { path: "^src/core/(configurationNG|store)(/|$)" }
		},
		{
			from: { path: "^src/core/application/" },
			to: {
				path: "^src/core/(activity|configurationNG|data|locale|model|notification|store|view)(/|$)"
			}
		},
		{
			from: { path: "^src/core/configurationNG/" },
			to: {
				path: "^src/core/(3rd-party-licenses|activity|application|frame|model|store|view)(/|$)"
			}
		},
		{
			from: { path: "^src/core/data/" },
			to: { path: "^src/core/(activity|model)(/|$)" }
		},
		{
			from: { path: "^src/core/frame/" },
			to: {
				path: "^src/core/(3rd-party-licenses|activity|application|configurationNG|locale|model|view)(/|$)"
			}
		},
		{
			from: { path: "^src/core/locale/" },
			to: { path: "^src/core/store(/|$)" }
		},
		{
			from: { path: "^src/core/model/" },
			to: { path: "^src/core/(activity|configurationNG|store)(/|$)" }
		},
		{
			from: { path: "^src/core/notification/" },
			to: { path: "^src/core/(activity|store|view)(/|$)" }
		},
		{
			from: { path: "^src/core/view/" },
			to: { path: "^src/core/(activity|model|store)(/|$)" }
		},
		{
			from: { path: "^src/extensions/appModelAdapter/" },
			to: { path: "^src/(core/(application|model)|extensions/modelLoader)(/|$)" }
		},
		{
			from: { path: "^src/extensions/dataServicesAdapter/" },
			to: { path: "^src/core/application(/|$)" }
		},
		{
			from: { path: "^src/extensions/deep-linking/" },
			to: { path: "^src/core/(activity|application|model)(/|$)" }
		},
		{
			from: { path: "^src/extensions/dirtyHandling/" },
			to: { path: "^src/core/(activity|application)(/|$)" }
		},
		{
			from: { path: "^src/extensions/localization/" },
			to: { path: "^src/core/(application|frame|locale|view)(/|$)" }
		},
		{
			from: { path: "^src/extensions/modelLoader/" },
			to: { path: "^src/core/(application|model)(/|$)" }
		},
		{
			from: { path: "^src/extensions/notification/" },
			to: { path: "^src/core/(application|notification)(/|$)" }
		}
	],
	options: {
		// No `collapse` here, on purpose: collapsing turns every intra-component
		// edge into a self-edge, and the reporter drops those together with any
		// violation on them — an offending import inside a component would pass.
		// The graph configs collapse for readability; validation runs file-level.
		tsConfig: { fileName: "tsconfig.json" },
		tsPreCompilationDeps: true,
		includeOnly: "^src/(core|extensions)/",
		doNotFollow: { path: "node_modules" },
		exclude: { path: "\\.(test|spec)\\.(ts|tsx)$|/__tests__/|^src/test/" },
		reporterOptions: {
			flat: {
				theme: {
					graph: {
						rankdir: "TB", // importers on top, leaf deps at bottom
						splines: "ortho", // straight lines with right-angle corners
						ranksep: "0.6" // more vertical breathing room
					},
					modules: [
						{
							criteria: { source: "^src/core/" },
							attributes: { shape: "box", style: "filled", fillcolor: "#ffcc00" }
						},
						{
							criteria: { source: "^src/extensions/" },
							attributes: { shape: "box", style: "filled", fillcolor: "#ccddff" }
						}
					],
					dependencies: [
						{
							criteria: { valid: true },
							attributes: { color: "#000000", penwidth: "1.5", arrowhead: "normal" }
						},
						{
							criteria: { valid: false },
							attributes: { color: "#cc0000", penwidth: "2", arrowhead: "normal" }
						}
					]
				}
			}
		}
	}
};
