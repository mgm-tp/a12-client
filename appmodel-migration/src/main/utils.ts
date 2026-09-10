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
 * @internal
 * Recursively updates an object's properties based on a provided update function.
 *
 * @param obj The object to iterate over and update.
 * @param updateFunction The function to apply to each property.
 * It gets the current value and path and returns the updated value.
 * @returns The updated object.
 */
export function traverseAndUpdateObject(
	obj: unknown,
	updateFunction: (selectedElement: unknown, path: string[]) => unknown
): unknown {
	const recursiveUpdate = (currentData: unknown, path: string[] = []): unknown => {
		if (Array.isArray(currentData)) {
			return processArray(currentData, path, recursiveUpdate, updateFunction);
		} else if (currentData !== null && typeof currentData === "object") {
			return processObject(currentData as object, path, recursiveUpdate, updateFunction);
		} else {
			return updateFunction(currentData, path);
		}
	};

	return recursiveUpdate(obj);
}

/**
 * @internal
 * Processes an array by recursively applying the updateFunction to each element.
 *
 * @param array The array to process.
 * @param path The current path reached up to this point in the object.
 * @param recursiveUpdate The recursive update function.
 * @param updateFunction The function to apply to each element.
 * @returns The processed array.
 */
function processArray(
	array: unknown[],
	path: string[],
	recursiveUpdate: (data: unknown, path: string[]) => unknown,
	updateFunction: (selectedElement: unknown, path: string[]) => unknown
): unknown[] {
	return array.map((item, index) => {
		const newPath = [...path, index.toString()];
		const updatedItem = updateFunction(item, newPath);
		return recursiveUpdate(updatedItem, newPath);
	});
}

/**
 * @internal
 * Processes an object by recursively applying the updateFunction to each key-value pair.
 *
 * @param obj The object to process.
 * @param path The current path reached up to this point in the object.
 * @param recursiveUpdate The recursive update function.
 * @param updateFunction The function to apply to each property.
 * @returns The processed object.
 */
function processObject(
	obj: object,
	path: string[],
	recursiveUpdate: (data: unknown, path: string[]) => unknown,
	updateFunction: (selectedElement: unknown, path: string[]) => unknown
): object {
	const updatedObject: { [key: string]: unknown } = {};
	for (const [key, value] of Object.entries(obj)) {
		const newPath = [...path, key];
		const updatedValue = updateFunction(value, newPath);
		updatedObject[key] = recursiveUpdate(updatedValue, newPath);
	}
	return updatedObject;
}

/**
 * @internal
 * Checks if a given path is valid for migration based on the count of occurrences of specific segments.
 *
 * @param path The path to be checked, as an array of string segments.
 * @param segmentsToCheck An array of segments (strings) whose occurrences in the path are to be counted.
 * @param validCount The expected total number of occurrences of the segments to check within the path.
 * @returns Returns `true` if the total count of occurrences of the segments to check in the path equals `validCount`, otherwise `false`.
 *
 *
 * This function counts how many times each segment in `segmentsToCheck` appears in the provided `path`.
 * It then calculates the total sum of these occurrences and compares it with `validCount`.
 */
export function isValidPathForMigration(
	path: string[],
	segmentsToCheck: string[],
	validCount: number
): boolean {
	const countOccurrences = (segment: string) => path.filter(p => p === segment).length;

	const totalSegmentOccurrences = segmentsToCheck.reduce(
		(sum, segment) => sum + countOccurrences(segment),
		0
	);

	return validCount === totalSegmentOccurrences;
}

/** @internal Help function */
export function getLastSegment(path: string[]): string {
	return path[path.length - 1];
}
