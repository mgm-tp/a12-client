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
