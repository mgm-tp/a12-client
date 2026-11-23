// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import lodashMerge from "lodash.merge";

import type { DgMerged } from "../changeLog/changeLog.js";
import type { DgDocument, DocumentGraph } from "../documentGraph.js";
import type { DgChange } from "../slices.js";
import type { DeepReadonly } from "../utilityTypes.js";

/**
 * @internal
 *
 * @returns a new {@link DocumentGraph}
 */
export function createDG(): DeepReadonly<DocumentGraph> {
	return {
		documents: {
			byDocRef: {}
		},
		links: {
			byId: {},
			linkIdsByDocId: {}
		}
	};
}

/**
 * @internal
 *
 * The docs and links of the `partialDg` DG is merged with the `dg` DG (first argument).
 * The merging handles the case where docs or links exist in both DGs; in this case the
 * doc properties of `partialDg` takes precedence, like loadingStates. Thus, we mean more a "merge into".
 */
export function mergeInto(args: {
	dg: DeepReadonly<DocumentGraph>;
	partialDg: DeepReadonly<DocumentGraph>;
}): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const { dg, partialDg } = args;
	// First merge documents including a merge of the internal structures
	let docs = dg.documents.byDocRef;
	const partDocs = partialDg.documents.byDocRef;
	for (const docId in partDocs) {
		if (Object.prototype.hasOwnProperty.call(partDocs, docId)) {
			docs = {
				...docs,
				// oxlint-disable-next-line typescript/no-non-null-assertion
				[docId]: mergeDgDocument({ doc: docs[docId], newDoc: partDocs[docId]! })
			};
		}
	}

	// then merge links
	const byId = { ...partialDg.links.byId, ...dg.links.byId };

	let linkIdsByDocId = dg.links.linkIdsByDocId as { [docId: string]: string[] };
	const partLinkIdsByDocId = partialDg.links.linkIdsByDocId;
	for (const docId in partLinkIdsByDocId) {
		if (Object.prototype.hasOwnProperty.call(partLinkIdsByDocId, docId)) {
			const mergedList = [
				...(partialDg.links.linkIdsByDocId[docId] ?? []),
				...(linkIdsByDocId[docId] ?? [])
			];
			// oxlint-disable-next-line typescript/no-non-null-assertion
			const sortedList = mergedList.sort((a, b) => byId[a]!.rank - byId[b]!.rank);

			linkIdsByDocId = {
				...linkIdsByDocId,
				[docId]: sortedList
			};
		}
	}

	const change: DgMerged = { kind: "dgMerged" };
	return [
		{
			documents: {
				byDocRef: docs
			},
			links: {
				// Note about order : same as above
				byId,
				linkIdsByDocId
			}
		},
		[change]
	];

	function mergeDgDocument(p: {
		doc: DeepReadonly<DgDocument> | undefined;
		newDoc: DeepReadonly<DgDocument>;
	}): DeepReadonly<DgDocument> {
		const { doc, newDoc } = p;
		if (doc === undefined) {
			return newDoc;
		}

		// merge docs if both are loaded, values from newDoc take precedence
		if (doc.loadingState === "loaded" && newDoc.loadingState === "loaded") {
			return lodashMerge(doc, newDoc);
		}

		// old doc wins if loaded and newDoc not yet loaded
		if (doc.loadingState === "loaded" && newDoc.loadingState !== "loaded") {
			return doc;
		}

		// new wins if it has "better" loadingState
		switch (newDoc.loadingState) {
			case "error":
			case "loaded":
			case "loading":
				return newDoc;
			case "missing":
				return doc;
		}
	}
}
