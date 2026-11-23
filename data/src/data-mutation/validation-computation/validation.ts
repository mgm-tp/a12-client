// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	Document,
	DocumentModel,
	EntityInstancePath,
	GroupInstance,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { filterDocumentByRelevance } from "../../core/api/model/relevance/filterDocumentByRelevance.js";
import { isNotRelevant } from "../../core/api/model/relevance/isNotRelevant.js";
import type { NotRelevantConfig } from "../../core/api/model/relevance/notRelevantConfig.js";
import { DocumentPath } from "../../core/api/path/documentPath.js";
import type { DgChangeLogSlice, DgSlice } from "../../internal/slices.js";
import type { DataActions } from "../../redux/api/actions.js";
import type { ReducerSignature } from "../../redux/api/types.js";
import { assertCondition, assertObject } from "../../typeguards.js";

import { KernelMessage } from "./message.js";
import { removeOutdatedMessages } from "./removeOutdatedMessages.js";
import type { ValidationData, ValidationEntry, ValidationSlice } from "./types.js";
import { ValidationConfig } from "./validationConfig/validationConfig.js";
import { DocumentRuntimeServiceFactory } from "./validationRuntimeService.js";

export function handleValidateFull(): ReducerSignature<DataActions.ValidateFullPayload> {
	return dataHolder => {
		assertObject(dataHolder.data);

		const newValidationData = validateFull(dataHolder.data);

		const validation = addMessagesToValidationData(
			dataHolder.data.validation,
			newValidationData,
			"full"
		);

		return {
			...dataHolder,
			data: {
				...dataHolder.data,
				validation: ValidationConfig.get().filterValidationResult(
					dataHolder.data.validation,
					validation,
					"full"
				)
			}
		};
	};
}

export function validateFull(data: DgSlice & DgChangeLogSlice & ValidationSlice): ValidationData {
	if (!data.entryPoint) {
		return data.validation;
	}
	const document = data.documentGraph.documents.byDocRef[data.entryPoint];

	if (!document || document.loadingState !== "loaded") {
		throw new Error(
			`Cannot validate document [docRef: ${data.entryPoint}] that is not in loadingState "loaded".`
		);
	}

	const documentRtService = DocumentRuntimeServiceFactory.get().createDocumentRtService(
		(document.documentModel as Model.DocumentAndValidationModel).generatedCodeAccessor,
		{
			ignoreUnknownFields: true
		}
	);

	const validationEntry = data.validation[data.entryPoint];
	const formallyIncorrectValuesMap = validationEntry
		? getFormallyIncorrectValues({
				validationEntry,
				document: document.document,
				dm: document.documentModel as Model.DocumentAndValidationModel,
				notRelevantConfigs: document.notRelevantConfigs as NotRelevantConfig[] | undefined
			})
		: new Map();

	const relevantDocument = filterDocumentByRelevance(
		document.document,
		document.documentModel as Model.DocumentAndValidationModel,
		document.notRelevantConfigs as NotRelevantConfig[] | undefined
	) as Document;

	const knownFormalErrorFields = validationEntry?.messages
		.filter(m => m.rulePath === KernelMessage.FORMAL_VALIDATION)
		.map(m => m.entityInstance);

	const newMessages = documentRtService
		.validateFull(relevantDocument, formallyIncorrectValuesMap)
		// all formal errors for formally incorrect values are removed here again to avoid duplicated errors
		.messages.filter(msg => !KernelMessage.isKnownFormalError(knownFormalErrorFields ?? [], msg));

	return convertMessagesToValidationData(data.entryPoint, newMessages);
}

export function handleValidatePart(): ReducerSignature<DataActions.ValidatePartPayload> {
	return (dataHolder, action) => {
		assertObject(dataHolder.data);

		const rootDoc = dataHolder.data.entryPoint;
		assertCondition(rootDoc !== undefined);

		const validationScope = ValidationConfig.get().getValidationScope(
			action.payload.relevantInstances,
			"partial"
		);

		const newValidationData = validatePart(dataHolder.data, validationScope);

		const validation = addMessagesToValidationData(
			dataHolder.data.validation,
			newValidationData,
			"partial",
			{
				[rootDoc]: action.payload.relevantInstances.map(DocumentPath.toString)
			}
		);

		return {
			...dataHolder,
			data: {
				...dataHolder.data,
				validation: ValidationConfig.get().filterValidationResult(
					dataHolder.data.validation,
					validation,
					"partial",
					action.payload.relevantInstances
				)
			}
		};
	};
}

export function validatePart(
	data: DgSlice & DgChangeLogSlice & ValidationSlice,
	relevantInstances: EntityInstancePath[]
): ValidationData {
	if (!data.entryPoint) {
		return data.validation;
	}

	const document = data.documentGraph.documents.byDocRef[data.entryPoint];

	if (!document || document.loadingState !== "loaded") {
		throw new Error(
			`Cannot validate document [docRef: ${data.entryPoint}] that is not in loadingState "loaded".`
		);
	}

	const documentRtService = DocumentRuntimeServiceFactory.get().createDocumentRtService(
		(document.documentModel as Model.DocumentAndValidationModel).generatedCodeAccessor,
		{
			ignoreUnknownFields: true
		}
	);

	const validationEntry = data.validation[data.entryPoint];
	const formallyIncorrectValuesMap = validationEntry
		? getFormallyIncorrectValues({
				validationEntry,
				document: document.document,
				dm: document.documentModel as Model.DocumentAndValidationModel,
				notRelevantConfigs: document.notRelevantConfigs as NotRelevantConfig[] | undefined
			})
		: new Map();

	const relevantDocument = filterDocumentByRelevance(
		document.document,
		document.documentModel as Model.DocumentAndValidationModel,
		document.notRelevantConfigs as NotRelevantConfig[] | undefined
	) as Document;

	const knownFormalErrorFields = validationEntry?.messages
		.filter(m => m.rulePath === KernelMessage.FORMAL_VALIDATION)
		.map(m => m.entityInstance);

	const newMessages = documentRtService
		.validatePart(relevantDocument, relevantInstances, formallyIncorrectValuesMap)
		.messages // all formal errors for formally incorrect values are removed here again to avoid duplicated errors
		.filter(msg => !KernelMessage.isKnownFormalError(knownFormalErrorFields ?? [], msg));

	return convertMessagesToValidationData(data.entryPoint, newMessages);
}

export function convertMessagesToValidationData(
	docRef: string,
	messages: Message[]
): ValidationData {
	return { [docRef]: { errorValues: {}, messages: messages } };
}

function getFormallyIncorrectValues(options: {
	validationEntry: ValidationEntry;
	document: GroupInstance;
	dm: DocumentModel;
	notRelevantConfigs?: NotRelevantConfig[];
}): Map<EntityInstancePath, string> {
	const { validationEntry, document, dm, notRelevantConfigs } = options;

	const formallyIncorrectValuesMap = new Map<EntityInstancePath, string>();

	Object.entries(validationEntry.errorValues).forEach(([dataRef, value]) => {
		const docPath = DocumentPath.fromString(dataRef);

		if (!isNotRelevant(dm, document, docPath, notRelevantConfigs)) {
			formallyIncorrectValuesMap.set(docPath, value);
		}
	});

	return formallyIncorrectValuesMap;
}

export function addMessagesToValidationData(
	currentMessages: ValidationData,
	newMessages: ValidationData,
	type: "field" | "partial" | "full",
	validationRelevantFields?: { [docRef: string]: string[] },
	removedGroupPath?: EntityInstancePath,
	isNotRelevantField?: (path: string) => boolean,
	isFieldComputed?: (path: EntityInstancePath) => boolean
): ValidationData {
	const filteredCurrentMessages = removeOutdatedMessages(
		currentMessages,
		type,
		validationRelevantFields,
		removedGroupPath,
		isNotRelevantField,
		isFieldComputed
	);
	const mergedMessages = mergeMessages(filteredCurrentMessages, newMessages);

	return mergedMessages;
}

function mergeMessages(
	currentMessages: ValidationData,
	newMessages: ValidationData
): ValidationData {
	const result: ValidationData = { ...currentMessages };

	Object.entries(newMessages).forEach(([docRef, docMessages]) => {
		if (result[docRef]) {
			result[docRef] = {
				errorValues: {
					...(result[docRef]?.errorValues ?? {}),
					...(docMessages?.errorValues ?? {})
				},
				messages: [...(result[docRef]?.messages ?? []), ...(docMessages?.messages ?? [])]
			};
		} else if (docMessages) {
			result[docRef] = docMessages;
		}
	});

	return result;
}
