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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import type {
	HashSet,
	IMetaField
} from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/a12internal";
import { IMetaKeys } from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/a12internal";
import type {
	DocumentModel,
	EntityInstancePath,
	FieldInstanceValue,
	GroupInstance,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade";
import type {
	Localizer,
	SupportedType,
	ValueConversion,
	ValueConversionConfig
} from "@com.mgmtp.a12.utils/utils-localization";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import type { DataReference } from "../../core/api/data-reference.js";
import { getValue } from "../../core/api/data/getValue.js";
import type { FormModel } from "../../core/api/model/form-model.js";
import { isNotRelevant } from "../../core/api/model/relevance/isNotRelevant.js";
import type { NotRelevantConfig } from "../../core/api/model/relevance/notRelevantConfig.js";
import { DocumentPath, getDocumentPath } from "../../core/api/path/documentPath.js";
import { getDataType } from "../../data-model/dataType.js";
import { getModelElement } from "../../data-model/getModelElement.js";
import type { Granularity } from "../../data-model/granularity.js";
import { computeGranularity } from "../../data-model/granularity.js";
import { DocServiceFactory } from "../../data-mutation/validation-computation/docServiceFactory.js";
import { expandComputedFields } from "../../data-mutation/validation-computation/expandComputedFields.js";
import { expandIndexReferencedFields } from "../../data-mutation/validation-computation/expandIndexReferencedFields.js";
import { KernelMessage } from "../../data-mutation/validation-computation/message.js";
import { isSetValidation } from "../../data-mutation/validation-computation/types.js";
import { ValidatorProviderFactory } from "../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DocumentGraph, LoadedDgDocument } from "../../internal/documentGraph.js";
import type { DeepReadonly } from "../../internal/utilityTypes.js";
import { DocumentModelLocalizableFactory } from "../../kernel-extension/documentModelLocalizableFactory.js";
import { assertCondition, assertObject } from "../../typeguards.js";
import { conversionConfigForModelPath } from "../../value-conversion/conversion.js";

import type { AbstractElementType } from "./abstract_dm_types.js";
import { AbstractElementTypes, abstractTypeFromElement } from "./abstract_dm_types.js";
import { isDgClAndValidationDataHolderShape, isSetDgCl } from "./types.js";

///////////////////////////////////////////////////////////////////////////////
// ---------------------------- DATA SELECTORS ------------------------------//
///////////////////////////////////////////////////////////////////////////////

const logger = LoggerFactory.getLogger("Datagraph/Selectors");

export function selectValueByPath(
	state: object,
	activityId: string,
	dataRef: DataReference
): GroupInstance[] | GroupInstance | FieldInstanceValue | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const rootDoc = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		if (rootDoc?.loadingState === "loaded") {
			assertDataRefInRootDoc(state, activityId, dataRef);
			return getValue(rootDoc.document, dataRef);
		}
	}
	return undefined;
}

/**
 * Assert that the given dataRef has a valid structure according to the DM of the
 * rootDoc (multiplicities are not checked).
 */
function assertDataRefInRootDoc(
	state: object,
	activityId: string,
	dataRef: string,
	validTypes: readonly AbstractElementType[] = AbstractElementTypes
) {
	const docPath = DocumentPath.fromString(dataRef);

	const modelElement = selectModelElement(state, activityId, docPath);
	const abstractType =
		docPath.length === 0
			? "Group"
			: modelElement
				? abstractTypeFromElement(modelElement)
				: undefined;

	assertObject(
		abstractType,
		"invalid dataRef `${dataRef}` - only paths to elements inside root doc are supported"
	);
	assertCondition(
		validTypes.includes(abstractType),
		`invalid element type ${abstractType} - must be ${validTypes.join(" or ")}`
	);
}

/**
 * Note: This function only works if provided with a field-like data reference!
 * @param state
 * @param activityId
 * @param dataRef
 * @param localizer
 * @param converter
 * @returns The localized or formatted field value if no parse error exists for
 * the given data reference. If a parse error exists, the formally incorrect
 * value from the error is returned.
 */
export function selectUiValueByPath(
	state: object,
	activityId: string,
	dataRef: DataReference,
	localizer: Localizer,
	converter: ValueConversion
): string | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (
		isSetValidation(dataHolder?.data) &&
		isSetDgCl(dataHolder.data) &&
		dataHolder.data.entryPoint
	) {
		const msgForDoc = dataHolder.data.validation[dataHolder.data.entryPoint];
		const errorValue = msgForDoc?.errorValues[dataRef];
		if (errorValue) {
			return errorValue;
		}
	}

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return undefined;
		}
		assertDataRefInRootDoc(state, activityId, dataRef, ["FieldLike"]);

		const documentPath = DocumentPath.fromString(dataRef);

		const dataType = selectDataTypeByPath(state, activityId, dataRef);
		const value = DocServiceFactory.get()
			.getDocumentService()
			.getAssignedObject(document.document, documentPath);

		if (dataType && typeof dataType !== "string") {
			if (dataType.type === "EnumerationType") {
				const enumValue = dataType.values.find(e => e.value === value);

				return enumValue
					? localizer(
							...DocumentModelLocalizableFactory.enumerationValue(
								document.documentModel.header.id,
								enumValue,
								documentPath
							)
						)
					: undefined;
			} else if (dataType.type === "ConfirmType") {
				return localizer(
					...DocumentModelLocalizableFactory.confirmValue(
						document.documentModel.header.id,
						documentPath,
						value as true | null
					)
				);
			} else if (dataType.type === "BooleanType") {
				return localizer(
					...DocumentModelLocalizableFactory.booleanValue(
						document.documentModel.header.id,
						documentPath,
						value as boolean | null
					)
				);
			} else {
				const conversionConfig = conversionConfigForModelPath(
					document.documentModel as unknown as DocumentModel,
					documentPath
				);

				// explicitly check for undefined, so that false will still be formatted
				return value !== undefined && conversionConfig
					? converter.formatValue(value as SupportedType, conversionConfig)
					: undefined;
			}
		}
	}

	return undefined;
}

export function selectRowCountByPath(
	state: object,
	activityId: string,
	dataRef: DataReference
): number {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const rootDoc = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		if (rootDoc?.loadingState === "loaded") {
			assertDataRefInRootDoc(state, activityId, dataRef, ["Group"]);
			const rows = (getValue(rootDoc.document, dataRef) ?? []) as GroupInstance[];
			return rows.length;
		}
	}
	return 0;
}

///////////////////////////////////////////////////////////////////////////////
// ----------------------- DOCUMENT MODEL SELECTORS -------------------------//
///////////////////////////////////////////////////////////////////////////////

/**
 * @param state
 * @param activityId
 * @returns the document model name of the entry point document
 */
export function selectDocumentModelName(state: object, activityId: string): string | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return undefined;
		}

		return document.documentModel.header.id;
	}
	return undefined;
}

/**
 * @param state
 * @param activityId
 * @param dataRef
 * @param modelSelector
 * @returns the field data type for the given DataReference if it is a field, or the (optional) usage type of the group otherwise
 */
export function selectDataTypeByPath(
	state: object,
	activityId: string,
	dataRef: DataReference
): DocumentModel.FieldType | string | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (
		dataHolder?.data &&
		isDgClAndValidationDataHolderShape(dataHolder) &&
		dataHolder.data.entryPoint
	) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		return document?.loadingState === "loaded"
			? getDataType(document.documentModel as unknown as DocumentModel, dataRef)
			: undefined;
	}
	return undefined;
}

/**
 * (Idea: Provide two variants, selectModelElementByPath and
 * selectModelElementById to support the usage of IDs in the data graph
 * document service)
 */
/**
 * @param state
 * @param activityId
 * @param modelPath
 * @returns the document model element for the given model path
 */
export function selectModelElement(
	state: object,
	activityId: string,
	modelPath: ModelPath
): DocumentModel.Element | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return undefined;
		}

		return getModelElement(document.documentModel as unknown as DocumentModel, modelPath);
	}
	return undefined;
}

/**
 * TODO: Can potentially be removed again. Only necessary to implement the
 * Content Engine DocumentService.
 */
export function selectElementPath(
	state: object,
	activityId: string,
	elementId: string
): ModelPath | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return undefined;
		}

		return DocServiceFactory.get()
			.getDocumentModelSearchService(document.documentModel as unknown as DocumentModel)
			.getPathById(elementId);
	}
	return undefined;
}

export function selectGranularityForDataReference(
	state: object,
	activityId: string,
	dataRef: DataReference
): Granularity | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return undefined;
		}

		return computeGranularity(
			document.documentModel as unknown as DocumentModel,
			DocumentPath.fromString(dataRef)
		);
	}
	return undefined;
}

export function selectConversionConfigForModelPath(
	state: object,
	activityId: string,
	modelPath: ModelPath
): ValueConversionConfig | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			throw new Error(
				`Cannot retrieve conversion config for [docRef: ${dataHolder.data.entryPoint}] that is not in loadingState "loaded".`
			);
		}

		return conversionConfigForModelPath(
			document.documentModel as unknown as DocumentModel,
			modelPath
		);
	}
	throw new Error("Cannot return value conversion config for non-DG DataHolder!");
}

export function selectFieldRequired(
	state: object,
	activityId: string,
	dataRef: DataReference
): boolean {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return false;
		}

		const validatorProvider = ValidatorProviderFactory.get().getValidatorProvider(
			document.documentModel as Model.DocumentAndValidationModel
		);

		const id = ModelPath.toString(DocumentPath.fromString(dataRef));

		const metaField = validatorProvider
			.getMetaModel()
			.getValue(IMetaKeys.MODEL_META_FIELD, id) as IMetaField;

		if (metaField === undefined) {
			return false;
		}

		return !!metaField.getValue(
			IMetaKeys.FIELD_MANDATORY_GLOBAL_OR_IN_SURROUNDING_REPEATABLE_GROUP
		);
	}

	return false;
}

export function selectFieldComputed(
	state: object,
	activityId: string,
	dataRef: DataReference
): boolean {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		if (document?.loadingState !== "loaded") {
			return false;
		}

		const validatorProvider = ValidatorProviderFactory.get().getValidatorProvider(
			document.documentModel as Model.DocumentAndValidationModel
		);

		const id = ModelPath.toString(DocumentPath.fromString(dataRef));

		const result = validatorProvider
			.getMetaModel()
			.getValue(IMetaKeys.MODEL_CALC_FIELDS, "Server") as HashSet<IMetaField>;

		return (
			result !== null &&
			result !== undefined &&
			Array.from(result).some(meta => {
				return meta.getValue(IMetaKeys.FIELD_FULLNAME) === id;
			})
		);
	}

	return false;
}

export function selectIsNotRelevant(
	state: object,
	activityId: string,
	dataReference: DataReference
): boolean {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const dg = dataHolder.data.documentGraph;
		const entryPoint = dataHolder.data.entryPoint;
		const entryDoc = dg.documents.byDocRef[entryPoint];

		assertCondition(entryDoc?.loadingState === "loaded");

		const elementPath = DocumentPath.fromString(dataReference);

		return isNotRelevant(
			entryDoc.documentModel as unknown as DocumentModel,
			entryDoc.document as GroupInstance,
			elementPath,
			entryDoc.notRelevantConfigs as NotRelevantConfig[] | undefined
		);
	}
	return false;
}

export function selectEnumerationValues(
	state: object,
	activityId: string,
	dataReference: DataReference,
	dataContext: EntityInstancePath
): readonly DocumentModel.EnumValue[] {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	const documentPath = DocumentPath.fromString(dataReference);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const modelElement = selectModelElement(state, activityId, documentPath);

		const entryDoc = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		if (entryDoc?.loadingState === "loaded") {
			if (modelElement?.type === "Field" && modelElement.fieldType.type === "EnumerationType") {
				const fce = entryDoc.formModel?.content.fieldConfiguration.field?.find(fce =>
					ModelPath.equal(fce.elementPath as ModelPath, documentPath)
				);

				return filterEnumerationValues(
					dataHolder.data.documentGraph,
					dataHolder.data.entryPoint,
					modelElement.fieldType.values,
					dataContext,
					fce
				);
			}
		}
	}

	return [];
}

/**
 * Return the enumeration values for a dependent enumeration field.
 *
 * @param dependentField the field and value for which the enumeration values should be determined
 * @param definition the Melies dependent enumeration definition
 */
function filterEnumerationValues(
	dg: DeepReadonly<DocumentGraph>,
	docRef: string,
	modelValues: readonly DocumentModel.EnumValue[],
	context: EntityInstancePath,
	fieldConfigurationEntry?: DeepReadonly<FormModel.FieldConfigurationEntry>
): readonly DocumentModel.EnumValue[] {
	if (fieldConfigurationEntry?.dependentEnumeration?.constraint) {
		const masterFieldDocumentPath = getDocumentPath(
			fieldConfigurationEntry.dependentEnumeration.masterFieldPath as ModelPath,
			context
		);
		const dgDoc = dg.documents.byDocRef[docRef];
		assertCondition(dgDoc?.loadingState === "loaded");

		const jsonValue = getValue(dgDoc.document, DocumentPath.toString(masterFieldDocumentPath));

		// treat null values as empty string
		// TODO: what is the right way to handle empty master values?
		// they cannot be modeled in the FMM at the moment
		const masterValue = jsonValue ?? "";
		const constraint = fieldConfigurationEntry.dependentEnumeration.constraint.find(
			c => c.masterValue === masterValue
		);
		if (constraint) {
			const constraintValues = constraint.constraintValues.map(v => v.value);
			return modelValues.filter(x => constraintValues.includes(x.value));
		}
	}

	return modelValues;
}

export function selectTimeZone(state: object, activityId: string): string | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		return document?.loadingState === "loaded"
			? document.documentModel.content.modelConfig.timeZone
			: undefined;
	}

	return undefined;
}

export function selectBaseYear(state: object, activityId: string): number | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (isSetDgCl(dataHolder?.data) && dataHolder.data.entryPoint) {
		const document = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];

		return document?.loadingState === "loaded"
			? document.documentModel.content.modelInfo.baseYear
			: undefined;
	}

	return undefined;
}

///////////////////////////////////////////////////////////////////////////////
// --------------------- VALIDATION MESSAGE SELECTORS -----------------------//
///////////////////////////////////////////////////////////////////////////////

export function selectMessagesByDataRef(
	state: object,
	activityId: string,
	dataReference: DataReference
): Message[] {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (
		isSetValidation(dataHolder?.data) &&
		isSetDgCl(dataHolder.data) &&
		dataHolder.data.entryPoint
	) {
		const msgForDoc = dataHolder.data.validation[dataHolder.data.entryPoint]?.messages ?? [];
		const messages = msgForDoc.filter(msg =>
			KernelMessage.effectiveFieldReferences(msg).map(DocumentPath.toString).includes(dataReference)
		);

		const doc = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		assertCondition(doc?.loadingState === "loaded");
		return expandMessages(state, activityId, doc as LoadedDgDocument, messages);
	}

	return [];
}

export function selectAllMessages(state: object, activityId: string): Message[] {
	const result = selectAllMessagesAndDocument(state, activityId);

	return result ? expandMessages(state, activityId, result.document, result.messages) : [];
}

export function selectAllMessagesWithOriginalIndices(state: object, activityId: string): Message[] {
	const result = selectAllMessagesAndDocument(state, activityId);

	return result
		? expandComputedFields(
				result.messages,
				result.document.documentModel,
				result.document.computedFields
			)
		: [];
}

function selectAllMessagesAndDocument(
	state: object,
	activityId: string
): { messages: Message[]; document: LoadedDgDocument } | undefined {
	const activity = ActivitySelectors.activityById(activityId)(state);
	const dataHolder = Activity.findDefaultDataHolder(activity);

	if (
		isSetValidation(dataHolder?.data) &&
		isSetDgCl(dataHolder.data) &&
		dataHolder.data.entryPoint
	) {
		const messages = Object.values(
			dataHolder.data.validation[dataHolder.data.entryPoint]?.messages ?? []
		);

		const doc = dataHolder.data.documentGraph.documents.byDocRef[dataHolder.data.entryPoint];
		assertCondition(doc?.loadingState === "loaded");
		return {
			messages,
			document: doc as LoadedDgDocument
		};
	}

	return undefined;
}

function expandMessages(
	state: object,
	activityId: string,
	document: LoadedDgDocument,
	messages: Message[]
): Message[] {
	const messagesWithExpandedComputedFields = expandComputedFields(
		messages,
		document.documentModel,
		document.computedFields
	);
	const messagesWithExpandedIndices = messagesWithExpandedComputedFields.map(msg =>
		expandIndexReferencedFields(msg, document.document, document.documentModel)
	);
	const messagesWithoutNotRelevantFields = messagesWithExpandedIndices.map(msg =>
		filterMessageFieldsByRelevance(msg, createIsRelevantAccessor(state, activityId))
	);

	logWhenNoReferencedFieldsInValidationMessages(messagesWithoutNotRelevantFields);

	return messagesWithoutNotRelevantFields;
}

export function createIsRelevantAccessor(
	state: object,
	activityId: string
): (path: EntityInstancePath) => boolean {
	return (path: EntityInstancePath) => {
		return !selectIsNotRelevant(state, activityId, DocumentPath.toString(path));
	};
}

export function filterMessageFieldsByRelevance(
	message: Message,
	isRelevant: (path: EntityInstancePath) => boolean
): Message {
	return {
		...message,
		referencedFields: message.referencedFields.filter(isRelevant),
		refOmissionErrorResponsible: message.refOmissionErrorResponsible.filter(isRelevant)
	};
}

function logWhenNoReferencedFieldsInValidationMessages(messages: Message[]): void {
	messages.forEach(message => {
		const relevantFields = KernelMessage.effectiveFieldReferences(message);
		if (!relevantFields.length) {
			logger.warn(`Message has no relevant fields: ${message.rulePath}`);
		}
	});
}
