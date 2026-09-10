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
import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	ComputedFieldInstance,
	Document,
	DocumentComputationResult,
	EntityInstancePath
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { fieldValueAccessorForDocument } from "../../../core/api/data/getValue.js";
import { ElementStateUtil } from "../../../core/api/model/relevance/elementState.js";
import { filterDocumentByRelevance } from "../../../core/api/model/relevance/filterDocumentByRelevance.js";
import { isNotRelevant } from "../../../core/api/model/relevance/isNotRelevant.js";
import type { NotRelevantConfig } from "../../../core/api/model/relevance/notRelevantConfig.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import type { ComputedFields } from "../../../internal/documentGraph.js";
import { expandIndexReferencedField } from "../../validation-computation/expandIndexReferencedFields.js";
import { KernelMessage } from "../../validation-computation/message.js";
import type { ParseError, ValidationEntry } from "../../validation-computation/types.js";
import { ValidationData } from "../../validation-computation/types.js";
import {
	addMessagesToValidationData,
	convertMessagesToValidationData
} from "../../validation-computation/validation.js";
import { DocumentRuntimeServiceFactory } from "../../validation-computation/validationRuntimeService.js";

// TODO: internal? not used anywhere else
export function updateValidationMessages(params: {
	docRef: string;
	validationData: ValidationData;
	changedFieldPaths: EntityInstancePath[];
	removedGroupPath?: EntityInstancePath;
	parseErrorForChangedField: ParseError | undefined;
	computedDocument: Document;
	computationResult: DocumentComputationResult;
	dm: Model.DocumentAndValidationModel;
	notRelevantConfigs: NotRelevantConfig[];
	computedFields: ComputedFields;
}) {
	const {
		validationData: currentValidationData,
		parseErrorForChangedField,
		docRef,
		changedFieldPaths,
		removedGroupPath,
		computedDocument,
		dm,
		computationResult,
		notRelevantConfigs,
		computedFields
	} = params;

	const isFieldComputed = (fieldPath: EntityInstancePath) =>
		Object.keys(computedFields).includes(ModelPath.toString(fieldPath));

	const formallyIncorrectValuesMap = collectFormallyIncorrectValues(
		currentValidationData[docRef],
		parseErrorForChangedField,
		computationResult.computedFieldInstancesWithErrors,
		changedFieldPaths,
		(fieldPath: EntityInstancePath) =>
			ElementStateUtil.isFieldNotRelevant(
				fieldPath,
				fieldValueAccessorForDocument(computedDocument, dm),
				notRelevantConfigs
			),
		isFieldComputed
	);

	// update validation state with partial validation on changed fields
	const documentRtService = DocumentRuntimeServiceFactory.get().createDocumentRtService(
		dm.generatedCodeAccessor,
		{ ignoreUnknownFields: true }
	);
	const filteredDocument = filterDocumentByRelevance(
		computedDocument,
		dm,
		notRelevantConfigs
	) as Document;
	const validationResult = documentRtService.validatePart(
		filteredDocument,
		changedFieldPaths,
		formallyIncorrectValuesMap
	);

	const knownFormalErrorFields = parseErrorForChangedField
		? [parseErrorForChangedField?.message.entityInstance, ...formallyIncorrectValuesMap.keys()]
		: [...formallyIncorrectValuesMap.keys()];

	const newValidationMessages = validationResult.messages.filter(
		msg => !KernelMessage.isKnownFormalError(knownFormalErrorFields, msg)
	);

	const parseErrorsFromComputations: ParseError[] =
		computationResult.computedFieldInstancesWithErrors.map(cf => ({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			message: cf.errorMessage!,
			value: cf.stringValue ?? ""
		}));

	let newValidationData = convertMessagesToValidationData(docRef, newValidationMessages);

	parseErrorsFromComputations.forEach(parseError => {
		newValidationData = ValidationData.addParseError(newValidationData, docRef, parseError);
	});

	const isNotRelevantAccessor = (path: string) => {
		const targetField = DocumentPath.fromString(path);
		// expand path, because messages might contain referenced fields with 0-indices
		const expandedPaths = expandIndexReferencedField(targetField, computedDocument, dm);

		return expandedPaths.some(p => isNotRelevant(dm, computedDocument, p, notRelevantConfigs));
	};

	const validation = addMessagesToValidationData(
		currentValidationData,
		newValidationData,
		"field",
		{
			[docRef]: changedFieldPaths.map(DocumentPath.toString)
		},
		removedGroupPath,
		isNotRelevantAccessor,
		isFieldComputed
	);
	return validation;
}

/*
 * collects all known formally incorrect fields with parse and computation errors and their values into a Map instance
 * sources are:
 * - all known ParseErrors from former validations
 * - new ParseErrors from the current value change
 * - new ComputationErrors from the computation after the current value changed
 */
function collectFormallyIncorrectValues(
	validationEntry: ValidationEntry | undefined,
	parseErrorForChangedField: ParseError | undefined,
	computedFieldInstancesWithErrors: ComputedFieldInstance[],
	changedFieldPaths: EntityInstancePath[],
	isFieldNotRelevant: (fieldPath: EntityInstancePath) => boolean,
	isFieldComputed: (fieldPath: EntityInstancePath) => boolean
) {
	const formallyIncorrectValuesMap = new Map<EntityInstancePath, string>();

	if (parseErrorForChangedField) {
		formallyIncorrectValuesMap.set(
			parseErrorForChangedField.message.entityInstance,
			parseErrorForChangedField.value
		);
	}

	validationEntry?.messages
		.filter(msg => msg.rulePath === KernelMessage.FORMAL_VALIDATION)
		.forEach(msg => {
			const typedDocPath = msg.entityInstance;

			/**
			 * Only add parse errors if the field hasn't been changed and is relevant.
			 * If the field has been changed, the parse error is outdated.
			 */
			if (
				changedFieldPaths.every(p => !DocumentPath.equal(p, typedDocPath)) &&
				!isFieldNotRelevant(msg.entityInstance) &&
				!isFieldComputed(msg.entityInstance)
			) {
				formallyIncorrectValuesMap.set(
					typedDocPath,
					// we assume the errorValues object to contain the value for this field instance because we already received the respective ParseError object
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					validationEntry!.errorValues[DocumentPath.toString(msg.entityInstance)]
				);
			}
		});

	computedFieldInstancesWithErrors.forEach(formallyIncorrectComputedValue => {
		formallyIncorrectValuesMap.set(
			formallyIncorrectComputedValue.path,
			formallyIncorrectComputedValue.stringValue ?? ""
		);
	});
	return formallyIncorrectValuesMap;
}
