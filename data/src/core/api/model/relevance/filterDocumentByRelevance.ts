// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentModel,
	EntityInstancePath,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { findByPath } from "../../../../data-model/findByPath.js";
import { notUndefined } from "../../../../typeguards.js";
import { fieldValueAccessorForDocument } from "../../data/getValue.js";

import { ElementStateUtil } from "./elementState.js";
import type { NotRelevantConfig } from "./notRelevantConfig.js";

interface FilterDocumentByRelevanceResult {
	readonly filteredDocument: GroupInstance;
	readonly filteredPaths: EntityInstancePath[];
}

/**
 * Applies all dependent field and dependent group dependencies with the notRelevant flag.
 * I.e. removes all non-relevant fields and groups from the given document.
 *
 * @param document the document to filter
 * @param dm the document model of the given document
 * @param notRelevantConfigs the configs used to determine the notRelevant flag
 * @returns the document without non-relevant fields and groups
 */
function _filterDocumentByRelevance(
	document: GroupInstance,
	dm: DocumentModel,
	notRelevantConfigs?: NotRelevantConfig[]
): FilterDocumentByRelevanceResult {
	if (!notRelevantConfigs) {
		return { filteredDocument: document, filteredPaths: [] };
	}

	const getFieldValueByPath = fieldValueAccessorForDocument(document, dm);
	const filteredPaths: EntityInstancePath[] = [];
	const filteredDocument = filterObject(document, [], path => {
		if (
			!ElementStateUtil.isGroupNotRelevant(path, getFieldValueByPath, notRelevantConfigs) &&
			!ElementStateUtil.isFieldNotRelevant(path, getFieldValueByPath, notRelevantConfigs)
		) {
			return true;
		}
		filteredPaths.push(path);
		return false;
	}) as GroupInstance;

	return {
		filteredDocument,
		filteredPaths
	};

	// note: this is a complex piece of code that was copied here from the form engine repo
	function filterObject(
		currentData: object,
		path: EntityInstancePath,
		filterPredicate: (path: EntityInstancePath) => boolean
	): object | undefined {
		let result;

		try {
			const dmElement = findByPath(dm, path);

			if (Array.isArray(currentData) && dmElement.type === "Group") {
				const curElement = path[path.length - 1];
				const parentPath = path.slice(0, -1);
				result = currentData
					.map((item, index) => {
						// kernel indices start at 1 !!!
						const newPath = [...parentPath, { ...curElement, index: index + 1 }];
						return filterPredicate(newPath)
							? filterObject(item, newPath, filterPredicate)
							: undefined;
					})
					.filter(notUndefined);
			} else if (
				!Array.isArray(currentData) &&
				currentData !== null &&
				typeof currentData === "object" &&
				!(currentData instanceof Date)
			) {
				const newEntries: [string, object | undefined][] = Object.entries(
					currentData as object
				).map(([key, value]) => {
					const newPath = [...path, { elementName: key, index: 1 }];
					if (!filterPredicate(newPath)) {
						return [key, undefined];
					}
					return [key, filterObject(value, newPath, filterPredicate)];
				});
				result = Object.fromEntries(newEntries.filter(([, value]) => value !== undefined));
			} else {
				result = currentData;
			}
		} catch {
			// the current element does not exist in the DM -> we keep it since there cannot be a dependency
			result = currentData;
		}
		return result;
	}
}

/**
 * Applies all dependent field and dependent group dependencies with the notRelevant flag.
 * I.e. removes all non-relevant fields and groups from the given document.
 *
 * @param document the document to filter
 * @param dm the document model of the given document
 * @param notRelevantConfigs the configs used to determine the notRelevant flag
 * @returns the document without non-relevant fields and groups
 */
export function filterDocumentByRelevance(
	document: GroupInstance,
	dm: DocumentModel,
	notRelevantConfigs?: NotRelevantConfig[]
): GroupInstance {
	return _filterDocumentByRelevance(document, dm, notRelevantConfigs).filteredDocument;
}

// TODO: internal? => used in eep
/**
 * Calculates all notRelevant fields and groups from a document.
 *
 * @param document the document to filter
 * @param dm the document model of the given document
 * @param notRelevantConfigs the configs used to determine the notRelevant flag
 * @returns a list of all not relevant fields ands groups
 */
export function getNotRelevantPaths(
	document: GroupInstance,
	dm: DocumentModel,
	notRelevantConfigs?: NotRelevantConfig[]
): EntityInstancePath[] {
	return _filterDocumentByRelevance(document, dm, notRelevantConfigs).filteredPaths;
}
