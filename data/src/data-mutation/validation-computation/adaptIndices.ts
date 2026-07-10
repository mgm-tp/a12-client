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

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import {
	DocumentPath,
	getDocumentPathForRepeatableGroup
} from "../../core/api/path/documentPath.js";
import { assertCondition } from "../../typeguards.js";

/**
 * @internal
 *
 * Temporary and slightly adapted copy of adaptIndices from UI Flows.
 *
 * TODO: Remove this code again once we re-validate after row deletions
 * (or additions/move operations in the future).
 */
export function adaptIndices(
	path: EntityInstancePath,
	removedGroupPath: EntityInstancePath
): EntityInstancePath {
	const indexOfChangedRow = removedGroupPath.at(-1)?.index ?? -1;
	assertCondition(indexOfChangedRow !== -1);
	const indexOfLastSegment = removedGroupPath.length - 1;

	return isPathInSameGroup(path, removedGroupPath) &&
		rowIsBehindChangedRow(path, indexOfLastSegment, indexOfChangedRow)
		? path.map((segment, idx) => segmentWithOffset(indexOfLastSegment, segment, idx))
		: path;

	function isPathInSameGroup(candidate: EntityInstancePath, rowPath: EntityInstancePath): boolean {
		// replace last index with 0
		const groupPath = getDocumentPathForRepeatableGroup(rowPath, rowPath);

		return DocumentPath.containsWith0IndexConsideration(candidate, groupPath);
	}

	function rowIsBehindChangedRow(
		rowDocPath: EntityInstancePath,
		indexOfLastSegment: number,
		indexOfChangedRow: number
	): boolean {
		// note:
		// when a row was removed, there cannot be an entry with its index
		// when a row was added, the row with the same index as the new row has to be moved up since it's now behind the new one
		return rowDocPath[indexOfLastSegment].index >= indexOfChangedRow;
	}

	function segmentWithOffset(
		indexOfLastSegment: number,
		segment: IEntityInstanceSegment,
		segmentIdx: number
	): IEntityInstanceSegment {
		return segmentIdx === indexOfLastSegment ? { ...segment, index: segment.index - 1 } : segment;
	}
}

interface IEntityInstanceSegment {
	readonly elementName: string;
	readonly index: number;
}
