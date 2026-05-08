/*
 * Adapted from the projects
 * lodash (https://github.com/lodash/lodash)
 * @types/lodash (https://github.com/DefinitelyTyped/DefinitelyTyped),
 *
 * URLs:
 * https://github.com/lodash/lodash/blob/main/lodash.js
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash/common/function.d.ts
 *
 * Licensed under the MIT License.
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 *
 * Adapted by mgm technology partners on 2025-05-04.
 * - simplified code and types into a single function
 * - improved types
 */
export function memoize<F extends (...args: never[]) => unknown>(
	func: F,
	resolver?: (...args: Parameters<F>) => unknown
): (...args: Parameters<F>) => ReturnType<F> {
	const cache = new Map();
	return (...args: Parameters<F>) => {
		const key = resolver?.(...args) ?? args[0];

		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = func(...args);
		cache.set(key, result);
		return result;
	};
}
