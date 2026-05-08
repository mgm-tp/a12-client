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

// tag::unstable[]
interface MyState {
	readonly someArray: string[];
	readonly someObject: object;
	readonly maybeArray?: string[];
}

/**
 * Returns a new reference on each call, meaning for the exact same state:
 *
 * selectArray(state) !== selectArray(state)
 */
export function selectArray(state: MyState): string[] {
	return [...state.someArray];
}

/**
 * Returns a new reference on each call, meaning for the exact same state:
 *
 * selectObject(state) !== selectObject(state)
 */
export function selectObject(state: MyState): object {
	return { selected: state.someObject };
}
// end::unstable[]
// tag::stable[]
/**
 * Returns the array as it is.
 *
 * NOTE: the reducer is responsible to only change the reference when needed!
 * In that case, for the exact same state:
 *
 * selectArray2(state) === selectArray2(state)
 */
export function selectArray2(state: MyState): string[] {
	return state.someArray;
}

/**
 * Returns the object as it is.
 *
 * NOTE: the reducer is responsible to only change the reference when needed!
 * In that case, for the exact same state:
 *
 * selectObject2(state) === selectObject2(state)
 */
export function selectObject2(state: MyState): object {
	return state.someObject;
}
// end::stable[]
// tag::real[]
/**
 * Returns an array property as is, but provides a fallback in case it doesn't exist.
 *
 * Since the empty array is defined inline, the return value will not be stable when
 * `maybeArray` does not exist!
 */
export function selectMaybeArray(state: MyState): string[] {
	return state.maybeArray ?? [];
}

/**
 * Returns an array property as is (it could be undefined).
 * Any fallback can be done by the caller.
 *
 * Since `undefined` is a primitive, the return value is stable.
 */
export function selectMaybeArray2(state: MyState): string[] | undefined {
	return state.maybeArray;
}
// end::real[]
