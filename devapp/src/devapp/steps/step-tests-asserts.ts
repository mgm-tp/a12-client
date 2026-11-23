// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import fastDeepEqual from "fast-deep-equal";

/**
 * This is a simple set of asserts to be used for the step tests.
 *
 * The step tests need to be executable in the browser and therefore cannot use
 * node asserts.
 *
 * They should also not depend on any 3rd party library, because that would need
 * to be a runtime dependency. See A12C-2790
 */
export const assert = {
	equal,
	deepEqual,
	notDeepEqual,
	isTrue,
	include,
	exists: assertExists,
	fail
};

function equal(
	expected: unknown,
	actual: unknown,
	message = `expected "${expected}" but got "${actual}"`
): void {
	if (expected !== actual) {
		fail(message);
	}
}

function deepEqual(expected: unknown, actual: unknown, message?: string): void {
	if (false === fastDeepEqual(expected, actual)) {
		fail(message);
	}
}

function notDeepEqual(expected: unknown, actual: unknown, message?: string): void {
	if (fastDeepEqual(expected, actual)) {
		fail(message);
	}
}

function isTrue(expected: boolean, message?: string): void {
	if (false === expected) {
		fail(message);
	}
}

export function assertExists(value: unknown, message?: string): asserts value {
	if (undefined === value || null === value) {
		fail(message);
	}
}

function include(value: object, include: object): void {
	return deepEqual(filterProps(value, new Set(Object.keys(include))), include);
}

function fail(message = "Generic assertion error - given condition is not met"): never {
	throw new Error(message);
}

function filterProps(value: object, props: Set<string>): object {
	return Object.fromEntries(Object.entries(value).filter(([k]) => props.has(k)));
}
