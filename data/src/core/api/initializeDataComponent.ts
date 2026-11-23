// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
