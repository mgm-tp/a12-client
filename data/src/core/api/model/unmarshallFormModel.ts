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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	DocumentModelSearchService,
	FieldInstanceValue
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";
import type { ValueConversionConfig } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { defaultValueConversion } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";

import { FormModel } from "./form-model.js";

/**
 * Parser for UI values, which receives a document model path and the value which should be parsed.
 */
export interface ValueParser {
	(path: ModelPath, uiValue: string): FieldInstanceValue;
}

/** Create a Kernel generated code based value parser for UI values. */
export const defaultValueParser: (documentModel: DocumentModel) => ValueParser = documentModel => {
	// note: this is the expected format for values inside of the form model, e.g. initial values & dependent field values
	// it must be consistent with the FMM validation for these values
	const defaultConversion = defaultValueConversion({
		decimalSeparator: ".",
		dateFragmentOrdering: "YEAR_MONTH_DAY",
		dateSeparator: "-",
		dateZeroOptional: false,
		dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss",
		dateRangeSeparator: "/",
		timeFormat: "HH:mm:ss",
		falseValue: "false",
		trueValue: "true",
		decimalPlacesOptional: false
	});

	return (path, uiValue) => {
		if (uiValue === "") {
			return null;
		}
		const field = findByPath(documentModel, path);
		if (field.type === "Field") {
			const conversionConfig = getConversionConfig(documentModel, path);
			return defaultConversion.parseValue(uiValue, conversionConfig).value ?? null;
		}
		return uiValue;
	};
};

// Note: Keep this function free from Kernel validation code. Instead, use an abstraction like ValueParser
/**
 * Add runtime properties to the given formModelJson.
 *
 * Warning: This function changes the given Json object.
 *
 * @param formModelJson The JSON to unmarshall - warning: is changed in-place
 * @param documentModel The document model used by the form model
 * @param valueParser Function to parse field values stored inside the form model
 */
export function unmarshallFormModel(
	formModelJson: object,
	documentModel: DocumentModel,
	valueParser: ValueParser
): FormModel {
	if (!FormModel.isInstance(formModelJson)) {
		throw new Error("Json is no valid FormModel!");
	}

	const runTimeFormModel = formModelJson;

	const documentModelSearchService =
		DocServiceFactory.get().getDocumentModelSearchService(documentModel);

	// This function has to be called before the others, because the paths are needed
	Path.add(runTimeFormModel, documentModelSearchService);
	Configuration.generateConfigurationMaps(runTimeFormModel, valueParser);
	return runTimeFormModel;
}

/** @internal */
namespace Path {
	/** @internal */
	export function add(formModel: FormModel, dmSearchService: DocumentModelSearchService): void {
		addPathToFieldConfiguration(formModel, dmSearchService);
		addPathToGroupConfiguration(formModel, dmSearchService);
	}

	/** @internal */
	function addPathToFieldConfiguration(
		formModel: FormModel,
		dmSearchService: DocumentModelSearchService
	): void {
		const mutableModel = formModel as DeepMutable<FormModel>;
		if (mutableModel.content.fieldConfiguration.field === undefined) {
			return;
		}

		for (const fc of mutableModel.content.fieldConfiguration.field) {
			const elementPath = dmSearchService.getPathById(fc.elementRef);
			if (elementPath) {
				fc.elementPath = elementPath;
			}

			if (fc.dependentEnumeration) {
				const elementPath = dmSearchService.getPathById(fc.dependentEnumeration.masterField);

				if (elementPath) {
					fc.dependentEnumeration.masterFieldPath = elementPath;
				}
			}
			if (fc.dependentField) {
				const elementPath = dmSearchService.getPathById(fc.dependentField.masterField);

				if (elementPath) {
					fc.dependentField.masterFieldPath = elementPath;
				}

				for (const caze of fc.dependentField.case) {
					if (caze.fieldRef) {
						caze.fieldPath = dmSearchService.getPathById(caze.fieldRef);
					}
				}
			}
		}
	}

	/** @internal */
	function addPathToGroupConfiguration(
		formModel: FormModel,
		dmSearchService: DocumentModelSearchService
	): void {
		const mutableModel = formModel as DeepMutable<FormModel>;
		if (mutableModel.content.groupConfiguration.group === undefined) {
			return;
		}

		for (const gc of mutableModel.content.groupConfiguration.group) {
			const elementPath = dmSearchService.getPathById(gc.groupRef);
			if (elementPath) {
				gc.groupPath = elementPath;
			}
			if (gc.dependentGroup) {
				const masterFieldPath = dmSearchService.getPathById(gc.dependentGroup.masterField);
				if (masterFieldPath) {
					gc.dependentGroup.masterFieldPath = masterFieldPath;
				}
			}
		}
	}
}

/** @internal */
namespace Configuration {
	/** @internal */
	export function generateConfigurationMaps(formModel: FormModel, valueParser: ValueParser): void {
		const mutableFormModel = formModel as DeepMutable<FormModel>;
		generateFieldConfigurationMap(mutableFormModel);
		generateGroupConfigurationMap(mutableFormModel);
		parseInitialValues(mutableFormModel, valueParser);
		parseDependentFieldsValues(mutableFormModel, valueParser);
		parseDependentFieldsMasterValues(mutableFormModel, valueParser);
		parseDependentGroupsMasterValues(mutableFormModel, valueParser);
	}

	/** @internal */
	function parseInitialValues(formModel: DeepMutable<FormModel>, valueParser: ValueParser): void {
		for (const fce of formModel.content.fieldConfiguration.field || []) {
			if (fce.initialValue !== undefined) {
				fce.initialValueTyped = valueParser(fce.elementPath, fce.initialValue);
			}
		}
	}

	/** @internal */
	function generateFieldConfigurationMap(formModel: DeepMutable<FormModel>): void {
		const fieldConfiguration = formModel.content.fieldConfiguration;
		fieldConfiguration.fieldMap = {};
		if (fieldConfiguration.field === undefined) {
			return;
		}

		for (const entry of fieldConfiguration.field) {
			fieldConfiguration.fieldMap[ModelPath.toString(entry.elementPath)] = entry;
		}
	}

	/** @internal */
	function parseDependentFieldsValues(
		formModel: DeepMutable<FormModel>,
		valueParser: ValueParser
	): void {
		for (const fce of formModel.content.fieldConfiguration.field || []) {
			if (fce.dependentField) {
				parseDependentFieldValues(fce.elementPath, fce.dependentField, valueParser);
			}
		}
	}

	/** @internal */
	function parseDependentFieldValues(
		fieldRef: ModelPath,
		depField: DeepMutable<FormModel.DependentField>,
		valueParser: ValueParser
	): void {
		for (const caze of depField.case) {
			if (caze.value !== undefined) {
				caze.valueTyped = valueParser(fieldRef, caze.value);
			}
		}
	}

	/** @internal */
	function parseDependentFieldsMasterValues(
		formModel: DeepMutable<FormModel>,
		valueParser: ValueParser
	): void {
		for (const fce of formModel.content.fieldConfiguration.field || []) {
			if (fce.dependentField) {
				parseMasterFieldValue(fce.dependentField, valueParser);
			}
		}
	}

	/** @internal */
	function parseMasterFieldValue(
		depField: DeepMutable<FormModel.DependentField>,
		valueParser: ValueParser
	): void {
		for (const caze of depField.case) {
			if (caze.masterValue !== undefined) {
				caze.masterValueTyped =
					caze.masterValue !== null
						? valueParser(depField.masterFieldPath, caze.masterValue)
						: null;
			}
		}
	}

	/** @internal */
	function parseDependentGroupsMasterValues(
		formModel: DeepMutable<FormModel>,
		valueParser: ValueParser
	): void {
		for (const fce of formModel.content.groupConfiguration.group || []) {
			if (fce.dependentGroup) {
				parseMasterGroupValue(fce.dependentGroup, valueParser);
			}
		}
	}

	/** @internal */
	function parseMasterGroupValue(
		depField: DeepMutable<FormModel.DependentGroup>,
		valueParser: ValueParser
	): void {
		for (const caze of depField.case) {
			if (caze.masterValue !== undefined) {
				caze.masterValueTyped =
					caze.masterValue !== null
						? valueParser(depField.masterFieldPath, caze.masterValue)
						: null;
			}
		}
	}

	/** @internal */
	function generateGroupConfigurationMap(formModel: DeepMutable<FormModel>): void {
		const groupConfiguration = formModel.content.groupConfiguration;
		groupConfiguration.groupMap = {};
		if (groupConfiguration.group === undefined) {
			return;
		}

		for (const entry of groupConfiguration.group) {
			groupConfiguration.groupMap[ModelPath.toString(entry.groupPath)] = entry;
		}
	}
}

/**
 * @internal
 * Utility type for the opposite of `DeepReadonly<T>`
 */
type DeepMutable<T> = {
	-readonly [P in keyof T]: DeepMutable<T[P]>;
};

function findByPath(documentModel: DocumentModel, targetPath: ModelPath): DocumentModel.Element {
	if (targetPath.length === 0) {
		return documentModel.content.modelRoot;
	}

	const element = new DocumentServiceFactory()
		.getDocumentModelSearchService(documentModel)
		.getByPath(targetPath);

	if (element === undefined) {
		throw new Error(`Invalid path: ${ModelPath.toString(targetPath)}`);
	}

	return element;
}

function getConversionConfig(documentModel: DocumentModel, path: ModelPath): ValueConversionConfig {
	const timeZone = documentModel.content.modelConfig.timeZone;
	const baseYear = documentModel.content.modelInfo.baseYear;
	const modelElement = findByPath(documentModel, path);

	if (modelElement.type === "Field") {
		return {
			...DocumentModel.extractConversionConfig(modelElement.fieldType, timeZone, baseYear),
			modelId: documentModel.header.id,
			modelPath: path
		};
	}

	throw new Error("Cannot return value conversion config for non-field model elements!");
}
