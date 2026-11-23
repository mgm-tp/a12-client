// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { DataActions } from "../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape, ReducerSignature } from "../../redux/api/types.js";
import { assertObject } from "../../typeguards.js";

import { ValidationData } from "../validation-computation/types.js";
import { ValidationConfig } from "../validation-computation/validationConfig/validationConfig.js";

import { changeValue } from "./changeValue/changeValue.js";
import { documentAndModelsForChange } from "./documentAndModelsForChange.js";
import { updateDocumentInDg } from "./updateDocumentInDg.js";

export function handleParsingFailed(): ReducerSignature<DataActions.ParsingFailedPayload> {
	return (
		dataHolder: DgClAndValidationDataHolderShape,
		action: Action<DataActions.ParsingFailedPayload>
	) => {
		const parseError = action.payload.parseError;

		assertObject(dataHolder.data);
		const docRef = dataHolder.data.entryPoint;
		if (!docRef) {
			throw new Error("Cannot handle parsing error for value without an entry point document.");
		}

		const { document, dm, fm, notRelevantConfigs, computedFields } = documentAndModelsForChange(
			dataHolder.data
		);

		// reset field value, perform computations and validation
		const changeResult = changeValue(
			document,
			docRef,
			action.payload.dataReference,
			null,
			parseError,
			dataHolder.data.validation,
			dm,
			fm,
			notRelevantConfigs,
			computedFields
		);

		const validation: ValidationData = ValidationData.addParseError(
			changeResult.validationData,
			docRef,
			parseError
		);

		const errorValuesEqual = ValidationData.areErrorValuesEqualForDocument(
			docRef,
			dataHolder.data.validation,
			validation
		);

		const updatedDg =
			changeResult.changedFieldPaths.length === 0
				? dataHolder.data.documentGraph
				: updateDocumentInDg(dataHolder.data, changeResult.document, docRef);

		return {
			...dataHolder,
			data: {
				...dataHolder.data,
				...updatedDg,
				validation: ValidationConfig.get().filterValidationResult(
					dataHolder.data.validation,
					validation,
					"field",
					changeResult.changedFieldPaths
				)
			},
			dirty:
				changeResult.changedFieldPaths.length === 0 && errorValuesEqual ? dataHolder.dirty : true
		};
	};
}
