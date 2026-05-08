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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { assertCondition, assertObject } from "../../typeguards.js";

import type { DgDocument, DocumentGraph } from "../documentGraph.js";
import type { DgChange } from "../slices.js";
import type { DeepReadonly, DocRef } from "../utilityTypes.js";

/** @internal */
export function addDocument(
	document: GroupInstance,
	docRef: DocRef,
	documentModel: Model.DocumentAndValidationModel,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const newDg = setDocumentInDG(
		document,
		docRef,
		{ docRef, loadingState: "loaded", documentModel, document: {} },
		dg
	);
	const change: DgChange = {
		kind: "docAdded",
		docRef
	};
	return [newDg, [change]];
}

/** @internal */
export function changeDocument(
	document: GroupInstance,
	docRef: DocRef,
	dg: DeepReadonly<DocumentGraph>
): [DeepReadonly<DocumentGraph>, DgChange[]] {
	const currentDocument = dg.documents.byDocRef[docRef];
	assertObject(currentDocument, "The document must already exist in the document graph.");
	assertCondition(
		currentDocument.loadingState === "loaded",
		"The document must already be in loading state 'loaded'."
	);
	if (currentDocument.document === document) {
		return [dg, []];
	}
	const newDg = setDocumentInDG(document, docRef, currentDocument, dg);
	const change: DgChange = {
		kind: "docChanged",
		docRef
	};
	return [newDg, [change]];
}

function setDocumentInDG(
	document: GroupInstance,
	docRef: DocRef,
	dgDocument: DeepReadonly<DgDocument>,
	dg: DeepReadonly<DocumentGraph>
): DeepReadonly<DocumentGraph> {
	// TODO: why do we have to repeat this everywhere? can we simply remove "loadingState" from the DgDocument interface?
	assertCondition(dgDocument.loadingState === "loaded");
	return {
		...dg,
		documents: {
			...dg.documents,
			byDocRef: {
				...dg.documents.byDocRef,
				[docRef]: {
					...dgDocument,
					document
				}
			}
		}
	};
}
