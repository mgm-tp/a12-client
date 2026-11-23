// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { DataActions } from "../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape, ReducerSignature } from "../../redux/api/types.js";
import { assertCondition } from "../../typeguards.js";

import { ValidationData } from "../validation-computation/types.js";
import { ValidationConfig } from "../validation-computation/validationConfig/validationConfig.js";

import { changeValue } from "./changeValue/changeValue.js";
import { parseWithTypeCheck } from "./changeValue/parseWithTypeCheck.js";
import { documentAndModelsForChange } from "./documentAndModelsForChange.js";
import { updateDocumentInDg } from "./updateDocumentInDg.js";

export function handleChangeValue(): ReducerSignature<DataActions.ChangeValuePayload> {
	return (
		dataHolder: DgClAndValidationDataHolderShape,
		action: Action<DataActions.ChangeValuePayload>
	) => {
		const { dataReference, value, userValue } = action.payload;

		assertCondition(dataHolder.data !== undefined);

		const { document, docRef, dm, fm, notRelevantConfigs, computedFields } =
			documentAndModelsForChange(dataHolder.data);

		const parseResult = parseWithTypeCheck(dataReference, dm, value, userValue);

		if (parseResult.type === "error") {
			// TODO: the code in this IF block is a copy of the parsingFailed reducer, this must be consolidated once
			//   both actions are combined into a single valueChanged action
			//  this action must contain value (as user input string), and also locale, converter & data formats

			// oxlint-disable-next-line typescript/no-non-null-assertion
			const parseError = parseResult.error!;
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
		}

		const changeResult = changeValue(
			document,
			docRef,
			dataReference,
			value,
			undefined,
			dataHolder.data.validation,
			dm,
			fm,
			notRelevantConfigs,
			computedFields
		);

		const errorValuesEqual = ValidationData.areErrorValuesEqualForDocument(
			docRef,
			dataHolder.data.validation,
			changeResult.validationData
		);

		if (
			changeResult.changedFieldPaths.length === 0 &&
			changeResult.changedGroupPaths.length === 0 &&
			errorValuesEqual
		) {
			return dataHolder;
		}

		const updatedDg =
			changeResult.changedFieldPaths.length === 0 && changeResult.changedGroupPaths.length === 0
				? dataHolder.data.documentGraph
				: updateDocumentInDg(dataHolder.data, changeResult.document, docRef);

		return {
			...dataHolder,
			data: {
				...dataHolder.data,
				...updatedDg,
				validation: ValidationConfig.get().filterValidationResult(
					dataHolder.data.validation,
					changeResult.validationData,
					"field",
					[...changeResult.changedFieldPaths, ...changeResult.changedGroupPaths]
				)
			},
			dirty: true
		};
	};
}
