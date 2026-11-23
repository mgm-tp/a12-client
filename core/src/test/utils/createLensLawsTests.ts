// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
