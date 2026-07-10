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

import deepEqual from "fast-deep-equal";

import { isRecord } from "../../utils.js";

export type Selector<R> = (state: object) => R;

/**
 * Represents either a selector for a value or the value itself
 */
export type SelectorOrObject<R> = Selector<R> | R;

function isSelector<T>(obj: unknown): obj is Selector<T> {
	return typeof obj === "function";
}

/**
 * @internal
 */
export function selectPossibleObject<T>(objOrFunc: SelectorOrObject<T>): Selector<T> {
	return state => {
		if (isSelector(objOrFunc)) {
			return objOrFunc(state);
		}
		return objOrFunc;
	};
}

/**
 * @internal
 */
export function createSliceSelector<T extends object>(
	sliceName: string,
	test: (slice: unknown) => slice is T
): (state: object) => T {
	return state => {
		const slice = isRecord(state) ? state[sliceName] : undefined;

		if (slice === undefined) {
			throw new Error(`Slice ${sliceName} does not exist: ${JSON.stringify(state)}`);
		}

		if (!test(slice)) {
			throw new Error(`State contains an invalid ${sliceName} slice.`);
		}

		return slice;
	};
}

/**
 * Adapter for selectors with arguments to make them shallow-equal compatible.
 *
 * Takes a selector, invokes it, and if a call with the "same" argument (deep
 * equal) yields the same result (deep equal) as the last call, return the
 * "same" object (shallow equal).
 *
 * Note: It is not memoizing, so the underlying selector will always be called
 * and it is guaranteed that the result is up-to-date.
 *
 * Limitations:
 * - arguments must be small, plain objects (they are stringified)
 * - return types should be small, plain objects (they are deep-compared and
 *   kept in-memory)
 * - all keys and results are kept in memory and never removed => only use for
 *   selectors with little variation
 * - supports only a single argument at the moment
 *
 * Note: If this method proves too complicated/risky, we need to implement some
 * "shouldComponentUpdate" logic, but that would need to be used in all
 * (including custom) components that select views from the store...
 *
 * @param selectorFactory underlying selector to adapt
 * @param stringifyArgs function to stringify the args - used to "deep compare"
 * args
 */
export function shallowEqualize<ArgsType extends unknown[], ReturnType>(
	selectorFactory: (...args: ArgsType) => Selector<ReturnType>,
	stringifyArgs: (...args: ArgsType) => string
): (...args: ArgsType) => Selector<ReturnType> {
	const map: { [key: string]: ReturnType | undefined } = {};
	return function selector(...args: ArgsType): Selector<ReturnType> {
		return state => {
			const key = stringifyArgs(...args);
			const memoizedResult = map[key];
			const currentResult = selectorFactory(...args)(state);
			if (memoizedResult !== undefined && deepEqual(currentResult, memoizedResult)) {
				return memoizedResult;
			} else {
				map[key] = currentResult;
				return currentResult;
			}
		};
	};
}

export function shallowEqualizeWithoutArgs<ReturnType>(
	selectorFactory: () => Selector<ReturnType>
): () => Selector<ReturnType> {
	return shallowEqualize(selectorFactory, () => "none");
}
