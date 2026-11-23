// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentModel,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

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
								doc.documentModel as DocumentModel,
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
