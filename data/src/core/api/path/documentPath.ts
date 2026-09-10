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

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { intersect } from "./intersect.js";

/**
 * FIXME: Was marked as internal, but the method is used in form elements and
 * ui flows. Should it be internal or public?
 *
 * Merge the current context with the documentModelPath of the required element
 * E.g. current context:
 * [["rootGroup"], ["detachedRepeat", 2]]
 *
 * documentModelPath of the element:
 * [["rootGroup"], ["detachedRepeat"],["numberField"]]
 *
 * needed documentPath:
 * [["rootGroup"], ["detachedRepeat", 2], ["numberField"]]
 *
 * The function looks for every segment of the DocumentModelPath if this segment
 * is in the context. If this is the case, it takes the segment from the context,
 * which is with the needed index.
 * If it is not in the context, the index is filled with 1.
 *
 * @param context Current data context
 * @param documentModelPath The document model path from which a document path should
 * be created
 */
export function getDocumentPath(
	modelPath: PathSegment[],
	context: EntityInstancePath
): EntityInstancePath {
	const documentPath = intersect(modelPath, context);

	for (const segment of modelPath.slice(documentPath.length)) {
		documentPath.push({ ...segment, index: 1 });
	}

	return documentPath;
}

interface PathSegment {
	readonly elementName: string;
	readonly index?: number;
}

/**
 * Merges the modelPath and the given context and sets the index
 * of the last path segment to 0.
 */
export function getDocumentPathForRepeatableGroup(
	modelPath: ModelPath,
	dataContext: EntityInstancePath
): EntityInstancePath {
	return getDocumentPathWithIndex(modelPath, dataContext, 0);
}

/**
 * Merges the modelPath and the given context and sets the index
 * of the last path segment to the given index.
 */
export function getDocumentPathWithIndex(
	modelPath: ModelPath,
	dataContext: EntityInstancePath,
	index: number
): EntityInstancePath {
	const basePath = getDocumentPath(modelPath, dataContext);
	return basePath.length
		? [
				...basePath.slice(0, -1),
				{
					...basePath[basePath.length - 1],
					index
				}
			]
		: [];
}

// Copied from the Form Engine

export namespace DocumentPath {
	/**
	 * Function to compare two EntityInstancePaths.
	 * @returns true if the given paths are equal
	 */
	export function equal(p1: EntityInstancePath, p2: EntityInstancePath): boolean {
		return (
			p1.length === p2.length &&
			p1.every((p1e, i) => p1e.elementName === p2[i].elementName && p1e.index === p2[i].index)
		);
	}

	/**
	 * Function to compare two EntityInstancePaths.
	 * If an index of a path segment in p1 is 0, any index value for respective path segment of p2 is allowed
	 * @returns true if the given paths are equal
	 */
	export function isEqualWith0IndexConsideration(
		p1: EntityInstancePath,
		p2: EntityInstancePath
	): boolean {
		return (
			p1.length === p2.length &&
			p1.every(
				(p1e, i) =>
					p1e.elementName === p2[i].elementName && (p1e.index === 0 || p1e.index === p2[i].index)
			)
		);
	}

	/**
	 * @returns true if the first given EntityInstancePath contains the second given EntityInstancePath as a prefix
	 */
	export function contains(p1: EntityInstancePath, p2: EntityInstancePath): boolean {
		if (p2.length > p1.length) {
			return false;
		}
		return !p2.some(
			(element, idx) =>
				p1[idx].elementName !== element.elementName || p1[idx].index !== element.index
		);
	}

	/**
	 * Function to compare two EntityInstancePaths.
	 * If an index of a path segment in ancestorPath is 0, any index value for respective path segment of descendantPath is allowed
	 * @returns true if descendantPath contains ancestorPath as a prefix
	 */
	export function containsWith0IndexConsideration(
		descendantPath: EntityInstancePath,
		ancestorPath: EntityInstancePath
	): boolean {
		if (ancestorPath.length > descendantPath.length) {
			return false;
		}
		return !ancestorPath.some(
			(element, idx) =>
				descendantPath[idx].elementName !== element.elementName ||
				(element.index !== 0 && descendantPath[idx].index !== element.index)
		);
	}

	/**
	 * Function to compare two EntityInstancePaths.
	 * If an index of a path segment in p2 is 0, any index value for respective path segment of p1 is allowed
	 * @returns true if the first given EntityInstancePath contains the second given EntityInstancePath as a prefix
	 */
	export function containsPartially(
		descendantPath: EntityInstancePath,
		ancestorPath: EntityInstancePath
	): boolean {
		if (ancestorPath.length > descendantPath.length) {
			return false;
		}
		return !ancestorPath.some(
			(element, idx) =>
				descendantPath[idx].elementName !== element.elementName ||
				(descendantPath[idx].index !== 0 && descendantPath[idx].index !== element.index)
		);
	}

	/**
	 * Function to create an EntityInstancePath from string.
	 * @param str path as string
	 * @returns The created EntityInstancePath
	 */
	export function fromString(str: string): EntityInstancePath {
		const normalizedIdentifier = str.startsWith("/") ? str.slice(1) : str;
		return normalizedIdentifier.length > 0
			? normalizedIdentifier.split("/").map(segment => {
					const openBracket = segment.indexOf("[");
					const elementName = segment.substring(0, openBracket);
					const indexString = segment.substring(openBracket + 1, segment.length - 1);
					return { elementName, index: Number(indexString) };
				})
			: [];
	}

	/**
	 * Function to convert an EntityInstancePath to a string.
	 */
	export function toString(path: EntityInstancePath): string {
		return "/" + path.map(segment => `${segment.elementName}[${segment.index}]`).join("/");
	}
}
