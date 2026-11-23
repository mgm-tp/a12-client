// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export function isRecord(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
	);
}

export function assertObject(reference: unknown, message?: string): asserts reference {
	if (reference === undefined || reference === null) {
		throw new Error(message ?? `Generic assertion error - given reference is '${reference}'.`);
	}
}

export function assertCondition(condition: boolean, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message ?? "Generic assertion error - given condition is not met.");
	}
}

/**
 * From the relationship-engine
 * @internal
 * assertion function to produce compile-time errors
 *
 * this can be used e.g. in the default case of a switch-case to highlight the
 * appearance of a new enumeration value
 */
export function assertUnreachable(x: never, message?: string): never {
	throw new Error(message ?? "Unexpected value found: " + x);
}

export function notUndefined<T>(arg: T | undefined): arg is T {
	return arg !== undefined;
}
