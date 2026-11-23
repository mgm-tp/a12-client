// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * @packageDocumentation
 * @module datagraph
 * @experimental
 */
import type { Model } from "@com.mgmtp.a12.client/client-core";

import { assertCondition, assertObject, assertUnreachable } from "../../typeguards.js";

import { isDocumentRelatedChange } from "../changeLog/changeLogImpl.js";
import type { DocumentGraph } from "../documentGraph.js";
import type { DgChangeLog } from "../slices.js";
import type { DeepReadonly } from "../utilityTypes.js";

export type DocumentMutation = "added" | "removed" | "modified";

export interface DocumentWithMutationMetadata {
	readonly document: {
		docRef: string;
		content: object;
		documentModel: DeepReadonly<Model.DocumentAndValidationModel>;
	};
	readonly mutation: DocumentMutation;
}

/**
 * @internal
 *
 * Reduces all document-related changes in the change log to a single mutation
 * per document.
 * During consolidation additions always precede modifications, i.e. if a
 * document was first added and then modified later on, the resulting mutation
 * is "added" with the document state aggregating all modifications.
 *
 * Example change log
 * - docChanged docRef/1
 * - docAdded   docRef/3
 * - docChanged docRef/2
 * - docChanged docRef/2
 * - docChanged docRef/2
 * - docChanged docRef/1
 * - docChanged docRef/3
 * - docChanged docRef/3
 *
 * Result:
 * - docRef/1 "modified"
 * - docRef/2 "modified"
 * - docRef/3 "added"
 */
export function documentsWithMetaData(
	documentGraph: DeepReadonly<DocumentGraph>,
	changeLog: DgChangeLog
): DocumentWithMutationMetadata[] {
	const consolidatedChanges = changeLog.changes.filter(isDocumentRelatedChange).reduce(
		(acc, currentChange) => {
			const { docRef, kind } = currentChange;
			const actualDocument = documentGraph.documents.byDocRef[docRef];
			assertObject(
				actualDocument,
				`Cannot handle addition/change of document [docRef: ${docRef}] that is not part of the document graph!`
			);
			assertCondition(
				actualDocument.loadingState === "loaded",
				"An added or changed document must be in loadingState 'loaded'."
			);
			switch (kind) {
				case "docChanged":
					acc[docRef] = {
						document: {
							docRef,
							content: actualDocument.document,
							documentModel: actualDocument.documentModel
						},
						mutation: acc[docRef]?.mutation ?? "modified"
					};
					break;
				case "docAdded":
					assertCondition(
						acc[docRef] === undefined,
						`Cannot handle 'docAdded' change for document [${docRef}] that was already used in earlier changes.`
					);
					acc[docRef] = {
						document: {
							docRef,
							content: actualDocument.document,
							documentModel: actualDocument.documentModel
						},
						mutation: "added"
					};
					break;
				default:
					assertUnreachable(kind);
			}

			return acc;
		},
		{} as { [key: string]: DocumentWithMutationMetadata }
	);

	return Object.values(consolidatedChanges);
}
