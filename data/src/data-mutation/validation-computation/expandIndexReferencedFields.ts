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

import type {
	DocumentModel,
	EntityInstancePath,
	GroupInstance,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { getValue } from "../../core/api/data/getValue.js";
import { DocumentPath } from "../../core/api/path/documentPath.js";
import { findByPath } from "../../data-model/findByPath.js";
import { isMultiSelect } from "../../kernel-extension/multiSelect.js";

/**
 * Expands the 0-indices in the referenced fields of the given message to all
 * currently existing group instances. This expansion step is performed for simple
 * repeatable groups. Path segments pointing to multi-select groups are not expanded.
 */
export function expandIndexReferencedFields(
	message: Message,
	document: GroupInstance,
	documentModel: DocumentModel
): Message {
	return {
		...message,
		referencedFields: message.referencedFields.flatMap(refField =>
			expandIndexReferencedField(refField, document, documentModel)
		),
		refOmissionErrorResponsible: message.refOmissionErrorResponsible.flatMap(refField =>
			expandIndexReferencedField(refField, document, documentModel)
		)
	};
}

/**
 * Expands the 0-indices in the given field path to all currently existing group
 * instances. This expansion step is performed for simple repeatable groups. Path
 * segments pointing to multi-select groups are not expanded.
 */
export function expandIndexReferencedField(
	refField: EntityInstancePath,
	document: GroupInstance,
	documentModel: DocumentModel
): EntityInstancePath[] {
	// Early return if no expansion needed
	if (!refField.some(segment => segment.index === 0)) {
		return [refField];
	}

	let results: EntityInstancePath[] = [];

	for (let idx = 0; idx < refField.length; idx++) {
		const segment = refField[idx];
		const pathUpToSegment = refField.slice(0, idx + 1);

		if (isExpandableSegment(segment, pathUpToSegment, documentModel)) {
			results = expandRepeatableGroup(segment, document, results);
		} else {
			results = addSegmentToAllPaths(segment, results);
		}
	}

	return results;
}

function isExpandableSegment(
	segment: EntityInstancePath[number],
	pathUpToSegment: EntityInstancePath,
	documentModel: DocumentModel
): boolean {
	if (segment.index !== 0) {
		return false;
	}

	const dmElement = findByPath(documentModel, pathUpToSegment);
	const isRepeatableGroup = dmElement?.type === "Group" && dmElement.repeatability > 1;
	const isMultiSelectGroup = dmElement && isMultiSelect(dmElement);

	return isRepeatableGroup && !isMultiSelectGroup;
}

function expandRepeatableGroup(
	segment: EntityInstancePath[number],
	document: GroupInstance,
	currentPaths: EntityInstancePath[]
): EntityInstancePath[] {
	if (currentPaths.length === 0) {
		// Handle repeatable root group
		const groupInstances = getValue(document, DocumentPath.toString([segment])) as
			| GroupInstance[]
			| undefined;
		const numberOfRows = groupInstances?.length ?? 1;

		const newPaths: EntityInstancePath[] = [];
		for (let i = 1; i <= numberOfRows; i++) {
			newPaths.push([{ ...segment, index: i }]);
		}
		return newPaths;
	} else {
		// Handle nested repeatable group
		return currentPaths.flatMap(currentPath => {
			const groupInstances = getValue(
				document,
				DocumentPath.toString([...currentPath, segment])
			) as GroupInstance[] | undefined;
			const numberOfRows = groupInstances?.length ?? 0;

			if (numberOfRows === 0) {
				// No rows exist, use index 1 as default
				return [[...currentPath, { ...segment, index: 1 }]];
			} else {
				// Create paths for all existing rows
				const expandedPaths: EntityInstancePath[] = [];
				for (let i = 1; i <= numberOfRows; i++) {
					expandedPaths.push([...currentPath, { ...segment, index: i }]);
				}
				return expandedPaths;
			}
		});
	}
}

function addSegmentToAllPaths(
	segment: EntityInstancePath[number],
	paths: EntityInstancePath[]
): EntityInstancePath[] {
	if (paths.length === 0) {
		return [[segment]];
	} else {
		// Mutate existing paths by adding the segment
		paths.forEach(path => path.push(segment));
		return paths;
	}
}
