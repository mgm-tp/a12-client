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

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import type { GeneratedCodeRtConfig } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import type { DataActions } from "../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape, ReducerSignature } from "../../redux/api/types.js";
import { assertObject } from "../../typeguards.js";

import { ValidationData } from "../validation-computation/types.js";
import { ValidationConfig } from "../validation-computation/validationConfig/validationConfig.js";

import { changeValue } from "./changeValue/changeValue.js";
import { documentAndModelsForChange } from "./documentAndModelsForChange.js";
import { updateDocumentInDg } from "./updateDocumentInDg.js";

export function handleParsingFailed(
	kernelOptions?: GeneratedCodeRtConfig
): ReducerSignature<DataActions.ParsingFailedPayload> {
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
			computedFields,
			kernelOptions
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
