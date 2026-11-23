// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

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
