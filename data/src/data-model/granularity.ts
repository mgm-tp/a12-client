// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocServiceFactory } from "../data-mutation/validation-computation/docServiceFactory.js";

/**
 * Simplified version of the granularity concept, that already exists in the
 * Form Engine Java code and in the SME.
 * Since it is only concerned with documents and document models, such code
 * probably belongs in the kernel.
 *
 * The array elements contain the ModelPath for all repeatable parts, for example in a structure
 * A (non-repeatable)
 *  -B (repeatable)
 *    -C (non-repeatable)
 *      -D (repeatable)
 * ["/A/B","/A/B/C/D"]
 */
export type Granularity = ModelPath[];

export function computeGranularity(
	documentModel: DocumentModel,
	modelPath: ModelPath
): Granularity {
	const documentModelService = DocServiceFactory.get().getDocumentModelSearchService(documentModel);

	return modelPath.flatMap((_e, idx) => {
		const currentPath = modelPath.slice(0, idx + 1);
		const element = documentModelService.getByPath(currentPath);

		return element?.type === "Group" && element.repeatability > 1 && !element.usageType
			? [currentPath]
			: [];
	});
}

export function granularityDistance(g1: Granularity, g2: Granularity): number {
	for (let i = 0; i < Math.min(g1.length, g2.length); i++) {
		if (!ModelPath.equal(g1[i], g2[i])) {
			return Number.MAX_SAFE_INTEGER;
		}
	}

	return g2.length - g1.length;
}
