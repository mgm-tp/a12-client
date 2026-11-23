// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentComputationResult,
	EntityInstancePath
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../../core/api/path/documentPath.js";

// TODO: internal? not used anywhere else
export function collectChangedDocumentPaths(
	isFieldValueChange: boolean,
	dataReference: string,
	computationResult: DocumentComputationResult
): { changedFieldPaths: EntityInstancePath[]; changedGroupPaths: EntityInstancePath[] } {
	// TODO: do we need to eliminate duplicates here?
	return {
		changedFieldPaths: [
			...(isFieldValueChange ? [DocumentPath.fromString(dataReference)] : []),
			...computationResult.computedFieldInstancesWithChanges.map(c => c.path),
			...computationResult.clearedFieldInstances.map(c => c.path),
			...computationResult.computedFieldInstancesWithErrors.map(c => c.path)
		],
		changedGroupPaths: isFieldValueChange ? [] : [DocumentPath.fromString(dataReference)]
	};
}
