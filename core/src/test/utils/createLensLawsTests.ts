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

import { strictEqual } from "node:assert/strict";

import type { Lens } from "../../core/lenses.js";

// generic tests generator for lens laws
export function createLensLawsTests<S, A>(lens: Lens<S, A>, s: S, a: A) {
	// exact translation: retrieving a previously set value yields
	// exactly that value
	it("get(set(a)(s)) = a", () => {
		const result = lens.get(lens.set(a)(s));
		strictEqual(result, a);
	});
	// source integrity: setting a previously retrieved value doesn't
	// change the state
	it("set(get(s))(s) = s", () => {
		const result = lens.set(lens.get(s))(s);
		strictEqual(s, result);
	});
	// no side-effects: setting a value multiple times doesn't change the state
	it("set(a)(set(a)(s)) = set(a)(s)", () => {
		const setResult = lens.set(a)(s);
		const setSetResult = lens.set(a)(setResult);
		strictEqual(setResult, setSetResult);
	});
}
