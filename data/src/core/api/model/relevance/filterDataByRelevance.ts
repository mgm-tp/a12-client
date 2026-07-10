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

import type { DocumentModel, GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import type { DocumentGraph } from "../../../../internal/documentGraph.js";
import type { DeepReadonly } from "../../../../internal/utilityTypes.js";

import { filterDocumentByRelevance } from "./filterDocumentByRelevance.js";
import type { NotRelevantConfig } from "./notRelevantConfig.js";

/**
 * Applies all dependent field and dependent group dependencies with the notRelevant flag.
 * I.e. removes all non-relevant fields and groups from all documents of the DG.
 *
 * @param dg the {@link DocumentGraph} holding all documents
 * @returns the loaded documents of the document graph without any non-relevant fields and groups
 */
export function filterDataByRelevance(dg: DeepReadonly<DocumentGraph>): {
	[docRef: string]: GroupInstance;
} {
	return Object.fromEntries(
		Object.entries(dg.documents.byDocRef)
			.map(([key, doc]) => {
				if (doc?.loadingState === "loaded") {
					return [
						key,
						{
							...doc,
							document: filterDocumentByRelevance(
								doc.document,
								doc.documentModel as unknown as DocumentModel,
								doc.notRelevantConfigs as NotRelevantConfig[] | undefined
							)
						}
					];
				} else {
					return [key, undefined];
				}
			})
			.filter(([, doc]) => doc !== undefined)
	);
}
