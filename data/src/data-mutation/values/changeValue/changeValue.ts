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
import type {
	Document,
	DocumentModel,
	EntityInstancePath
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../../core/api/data-reference.js";
import { getValue } from "../../../core/api/data/getValue.js";
import type { FormModel } from "../../../core/api/model/form-model.js";
import type { NotRelevantConfig } from "../../../core/api/model/relevance/notRelevantConfig.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import { getModelElement } from "../../../data-model/getModelElement.js";
import type { ComputedFields } from "../../../internal/documentGraph.js";
import type { KernelTypes } from "../../types.js";
import type { ParseError, ValidationData } from "../../validation-computation/types.js";

import { collectChangedDocumentPaths } from "./collectChangedDocumentPaths.js";
import { computeChangeProperties } from "./computeChangeProperties.js";
import { computeDocument } from "./computeDocument.js";
import { updateSingleFieldInstance } from "./updateSingleFieldInstance.js";
import { updateValidationMessages } from "./updateValidationMessages.js";

export function changeValue(
	document: Document,
	docRef: string,
	dataReference: DataReference,
	value: KernelTypes.Value,
	parseErrorForChangedField: ParseError | undefined,
	validationData: ValidationData,
	dm: Model.DocumentAndValidationModel,
	fm?: FormModel,
	notRelevantConfigs: NotRelevantConfig[] = [],
	computedFields: ComputedFields = {}
): {
	document: Document;
	validationData: ValidationData;
	changedFieldPaths: EntityInstancePath[];
	changedGroupPaths: EntityInstancePath[];
} {
	const oldValue = getValue(document, dataReference);
	const changedDocPath = DocumentPath.fromString(dataReference);

	// TODO: this value comparison will not work for object values
	if (
		value === oldValue &&
		!formalValidityOfEmptyFieldChanged({
			oldValue,
			value,
			previouslyFormallyInvalid:
				validationData[docRef]?.errorValues[DocumentPath.toString(changedDocPath)] !== undefined,
			newParseErrorForChangedField: parseErrorForChangedField
		})
	) {
		return {
			changedFieldPaths: [],
			changedGroupPaths: [],
			document,
			validationData
		};
	}

	const { isFieldValueChange, changedElementDataType, changedElementPath } =
		computeChangeProperties(dm, dataReference);

	const intermediateDocument = updateSingleFieldInstance(document, changedElementPath, value, dm);

	const { computedDocument, computationResult } = computeDocument({
		dm,
		fm,
		document: intermediateDocument,
		change: {
			elementDataType: changedElementDataType,
			elementPath: changedElementPath
		}
	});

	const { changedFieldPaths, changedGroupPaths } = collectChangedDocumentPaths(
		isFieldValueChange,
		dataReference,
		computationResult
	);

	/**
	 * TODO: Compute proper change objects instead of these path lists?
	 * - changedFieldPaths
	 * - changedGroupPaths
	 * - removedGroupPath
	 *
	 * Note: Allowing multiple removedGroupPaths would require a more complex
	 * logic to update indices, because the list of removed groups would need
	 * to be updated itself during this process. (Iterating over those
	 * paths in reverse order would also work)
	 * Since we don't need this at the moment, we keep it as simple as possible.
	 */
	const removedGroupPath = isGroupRemovedChange(dm, dataReference, value)
		? DocumentPath.fromString(dataReference)
		: undefined;

	const validation = updateValidationMessages({
		validationData,
		changedFieldPaths,
		removedGroupPath,
		parseErrorForChangedField,
		docRef,
		computedDocument,
		computationResult,
		dm,
		notRelevantConfigs,
		computedFields
	});

	return {
		document: computedDocument,
		validationData: validation,
		changedFieldPaths,
		changedGroupPaths
	};
}

/**
 * Returns true if both values are empty and
 * - a formal error was cleared from an invalid field or
 * - a formal error was added to a previously valid field
 */
function formalValidityOfEmptyFieldChanged(options: {
	oldValue: KernelTypes.Value;
	value: KernelTypes.Value;
	previouslyFormallyInvalid: boolean;
	newParseErrorForChangedField?: ParseError;
}): boolean {
	const { oldValue, value, previouslyFormallyInvalid, newParseErrorForChangedField } = options;

	return (
		isEmptyValue(value) &&
		isEmptyValue(oldValue) &&
		previouslyFormallyInvalid !== !!newParseErrorForChangedField
	);
}

function isEmptyValue(value: KernelTypes.Value): boolean {
	return value === undefined || value === null || value === "";
}

function isGroupRemovedChange(
	dm: DocumentModel,
	dataRef: string,
	value: KernelTypes.Value
): boolean {
	const docPath = DocumentPath.fromString(dataRef);
	const modelElement = getModelElement(dm, docPath);

	return (
		modelElement?.type === "Group" &&
		modelElement.repeatability > 1 &&
		docPath.every(s => s.index !== 0) &&
		value === undefined
	);
}
