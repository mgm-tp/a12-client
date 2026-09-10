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

import type {
	ValidationData,
	ValidationEntry,
	ValidationSlice
} from "../../data-mutation/validation-computation/types.js";
import { computeDocument } from "../../data-mutation/values/changeValue/computeDocument.js";
import { newChangeLog } from "../../internal/changeLog/changeLogImpl.js";
import type { DgDocument, DgLinkInternal } from "../../internal/documentGraph.js";
import type { DgChangeLogSlice, DgSlice } from "../../internal/slices.js";
import type { DocRef } from "../../internal/utilityTypes.js";

import { createComputedFieldsDataStructure } from "./data/createComputedFieldsDataStructure.js";
import { DocumentPath } from "./path/documentPath.js";

/**
 * @returns a filled {@link DgSlice} & {@link DgChangeLogSlice} object
 */
export function initializeDataComponent(
	docs: DgDocument[],
	links: DgLinkInternal[] = [],
	entryPoint?: string
): DgSlice & DgChangeLogSlice & ValidationSlice {
	//TODO: In the future the functionality to map the links to the data structure needs to be moved from the CDM project to here
	if (links.length !== 0) {
		throw new Error(
			"No links support implemented yet - At this time the links array should be empty!"
		);
	}

	if (entryPoint && !docs.some(doc => doc.docRef === entryPoint)) {
		throw new Error("Cannot set an entry point reference without the document to refer to.");
	}

	const { docs: computedDgDocs, validationData: initialValidationData } =
		performInitialComputation(docs);

	return {
		documentGraph: {
			documents: {
				byDocRef: {
					...computedDgDocs.reduce(
						(acc, doc) => {
							if (doc.loadingState !== "loaded") {
								return acc;
							}
							acc[doc.docRef] = {
								...doc,
								computedFields:
									doc.computedFields ?? createComputedFieldsDataStructure(doc.documentModel)
							};
							return acc;
						},
						{} as { [key: DocRef]: DgDocument }
					)
				}
			},
			links: {
				byId: {},
				linkIdsByDocId: {}
			}
		},
		entryPoint,
		changeLog: newChangeLog(),
		validation: initialValidationData
	};
}

function performInitialComputation(docs: DgDocument[]): {
	docs: DgDocument[];
	validationData: ValidationData;
} {
	const docsAndValidationEntries: { dgDoc: DgDocument; validationEntry?: ValidationEntry }[] =
		docs.map(doc => {
			if (doc.loadingState !== "loaded") {
				return { dgDoc: doc, validationEntry: undefined };
			}

			const { computationResult, computedDocument } = computeDocument({
				dm: doc.documentModel,
				fm: doc.formModel,
				document: doc.document
			});

			const errorValuesFromComputation: ValidationEntry["errorValues"] = Object.fromEntries(
				computationResult.computedFieldInstancesWithErrors.map(cf => [
					DocumentPath.toString(cf.path),
					cf.stringValue ?? ""
				])
			);

			return {
				dgDoc: { ...doc, document: computedDocument },
				validationEntry: { messages: [], errorValues: errorValuesFromComputation }
			};
		});

	return {
		docs: docsAndValidationEntries.map(e => e.dgDoc),
		validationData: Object.fromEntries(
			docsAndValidationEntries.map(e => [e.dgDoc.docRef, e.validationEntry])
		)
	};
}
