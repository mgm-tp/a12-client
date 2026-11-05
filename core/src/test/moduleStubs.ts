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

import { registerHooks } from "node:module";

/**
 * Whenever `useResizeDetector` is called with the `targetRef` option, `react-resize-detector`
 * schedules a `setTimeout(…, 0)` during render whose callback calls `setState`. That update runs
 * after `act(...)` has returned, so React logs "An update to <Widget> inside a test was not
 * wrapped in act(...)" for every widget that observes its own size, e.g. `ApplicationFrame`,
 * `LayoutPane` and `Grid`.
 *
 * Since `ResizeObserver` is a no-op in jsdom (see `./environment.js`), the real hook cannot
 * report a size change during tests anyway, so the module is resolved to a stub instead.
 *
 * The proper fix belongs in Widgets: the timer only exists on the `targetRef` code path, which
 * `react-resize-detector` keeps for backwards compatibility. Widgets that use the `ref` returned
 * by `useResizeDetector` instead do not schedule it, and once every call site is migrated this
 * stub can be dropped.
 *
 * This file has to be a mocha `require` entry of its own, listed before `./lib/test/setup.js`:
 * a module graph is fully resolved before any of its module bodies run, so a hook registered
 * from within the graph that imports the widgets comes too late.
 */
const resizeDetectorStubUrl = new URL("./resizeDetectorStub.js", import.meta.url).href;

registerHooks({
	resolve: (specifier, context, nextResolve) =>
		specifier === "react-resize-detector"
			? { url: resizeDetectorStubUrl, shortCircuit: true }
			: nextResolve(specifier, context)
});
