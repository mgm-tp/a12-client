// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { Relationship as RelationshipServerApi } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/Relationship.js";
import type { GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { assertObject } from "../../typeguards.js";

import type { LinkAdded, LinkDeleted, LinkDocChanged } from "../changeLog/changeLog.js";
import type { DgDocument, DgLinkInternal, DgLinks, DocumentGraph } from "../documentGraph.js";
import type { DgChange } from "../slices.js";
import type { DeepReadonly, DocRef } from "../utilityTypes.js";

import { mergeInto } from "./dg.js";

/**
 * placeholder for documentModelName of new link documents.
 * Will be overwritten by server.
 */
const LINK_DOC_PLACEHOLDER: Model.DocumentAndValidationModel = {
	/* oxlint-disable typescript/no-non-null-assertion */
	content: undefined!,
	header: undefined!,
	generatedCodeAccessor: undefined!
	/* oxlint-enable typescript/no-non-null-assertion */
};

const LINKDOC_DOC_REF_SUFFIX = "____link_doc";

let addedLinkIndex = 0;

/**
 * Only used internally to achieve independent test results.
 * @internal
 */
export function resetAddedLinkIndexForTesting(): void {
	addedLinkIndex = 0;
}

/** @internal */
export function addLink(
	linkDescriptor: DeepReadonly<RelationshipServerApi.LinkDescriptor>,
	linkDoc: DeepReadonly<GroupInstance> | undefined,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const linkRef = makeLinkRef();

	return mergeLink(linkRef, linkDoc, dg);

	function makeLinkRef(): RelationshipServerApi.LinkRef {
		return {
			linkDescriptor: linkDescriptor as RelationshipServerApi.LinkDescriptor,
			id: generateNewLinkId(linkDescriptor.relationshipModel)
		};
	}
	function generateNewLinkId(relshName: string): string {
		// logic taken vom extensions/relationship/internal/reducers/addLink.ts
		return relshName + "_NEW_" + ++addedLinkIndex;
	}
}

let counterForDifferentiation = 0;

function mergeLink(
	linkRef: RelationshipServerApi.LinkRef,
	linkDoc: DeepReadonly<GroupInstance> | undefined,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const docRef1 = linkRef.linkDescriptor.entities[0].docRef;
	assertObject(docRef1);
	const docRef2 = linkRef.linkDescriptor.entities[1].docRef;
	assertObject(docRef2);

	const linkDocRef = linkDoc ? generateLinkDocDocRef(linkRef.id) : undefined;

	const documents = {
		byDocRef: {
			[docRef1]: makeMissingTargetDgDocument(docRef1),
			[docRef2]: makeMissingTargetDgDocument(docRef2),
			...(linkDocRef
				? {
						[linkDocRef]: {
							docRef: linkDocRef,
							document: linkDoc,
							documentModel: LINK_DOC_PLACEHOLDER,
							loadingState: "loaded"
						} as DgDocument
					}
				: {})
			// No need to include [sourceDocRef], since mergeDgs can handle this case!
		}
	};

	const links: DgLinks = {
		byId: {
			[linkRef.id]: {
				linkRef,
				linkDocRef,
				/*
				 * Note: The extra counter is used to avoid having the same
				 * time stamp for multiple links in case they are loaded
				 * together and added shortly one after the other.
				 *
				 * The counter should usually be much smaller than the timestamp
				 * and thus should not influence the order as given by the
				 * timestamps alone.
				 */
				rank: Date.now() + counterForDifferentiation++
			}
		},
		linkIdsByDocId: {
			[docRef1]: [linkRef.id],
			[docRef2]: [linkRef.id]
		}
	};

	const partialDg: DocumentGraph = { documents, links };
	const [newDg /* drop changes */] = mergeInto({ dg, partialDg });
	const change: LinkAdded = {
		kind: "linkAdded",
		linkId: linkRef.id
	};
	return [newDg, [change]];

	function makeMissingTargetDgDocument(docRef: DocRef): DgDocument {
		return {
			docRef,
			loadingState: "missing"
		};
	}
}

/** @internal */
export function removeLink(
	linkRef: RelationshipServerApi.LinkRef,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const targetLink = dg.links.byId[linkRef.id];

	if (!targetLink) {
		throw new Error(`Cannot remove link [id: ${linkRef.id}] which does not exist.`);
	}

	// Update links.linkIdsByDocId
	// oxlint-disable-next-line typescript/no-non-null-assertion
	const docIds: DocRef[] = linkRef.linkDescriptor.entities.map(e => e.docRef!);
	const linkIdsByDocId = { ...dg.links.linkIdsByDocId };
	docIds.forEach(docId => {
		linkIdsByDocId[docId] = linkIdsByDocId[docId]?.filter(linkId => linkId !== linkRef.id);
	});
	const { linkDocRef } = targetLink;

	// Update links.byId
	const byId = { ...dg.links.byId };
	/* oxlint-disable typescript/no-dynamic-delete */
	delete byId[linkRef.id];

	// Update documents.byDocRef
	const byDocRef = { ...dg.documents.byDocRef };
	if (linkDocRef) {
		/* oxlint-disable typescript/no-dynamic-delete */
		delete byDocRef[linkDocRef];
	}

	const newDg: DeepReadonly<DocumentGraph> = {
		documents: {
			byDocRef
		},
		links: {
			byId,
			linkIdsByDocId
		}
	};
	const change: LinkDeleted = {
		kind: "linkDeleted",
		linkId: linkRef.id,
		linkRef
	};
	return [newDg, [change]];
}

/** @internal */
export function modifyLink(
	linkDocument: DeepReadonly<GroupInstance>,
	linkId: string,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const dgLink = dg.links.byId[linkId];

	if (!dgLink) {
		throw new Error(`Cannot modify link [id: ${linkId}] which does not exist.`);
	}

	// if no linkDocRef yet, the linkDoc is "new"
	const linkDocRef = dgLink.linkDocRef ?? generateLinkDocDocRef(linkId);

	const byId = {
		...dg.links.byId,
		[linkId]: {
			...dgLink,
			linkDocRef
		}
	};

	// Update documents.byDocRef
	const byDocRef = {
		...dg.documents.byDocRef,
		[linkDocRef]: {
			docRef: linkDocRef,
			document: linkDocument,
			documentModel: LINK_DOC_PLACEHOLDER,
			loadingState: "loaded" as const
		}
	};

	const newDg: DeepReadonly<DocumentGraph> = {
		documents: {
			byDocRef
		},
		links: {
			byId,
			linkIdsByDocId: dg.links.linkIdsByDocId
		}
	};
	const change: LinkDocChanged = {
		kind: "linkDocChanged",
		linkId
	};
	return [newDg, [change]];
}

/** @internal */
export function extractLinkDocument(
	{ linkDocRef }: DeepReadonly<DgLinkInternal>,
	dg: DeepReadonly<DocumentGraph>
): GroupInstance | undefined {
	const linkDgDoc = linkDocRef ? dg.documents.byDocRef[linkDocRef] : undefined;

	return linkDgDoc?.loadingState === "loaded" ? linkDgDoc.document : undefined;
}

/** @internal */
export function generateLinkDocDocRef(linkId: string): string {
	return `${linkId}${LINKDOC_DOC_REF_SUFFIX}`;
}
