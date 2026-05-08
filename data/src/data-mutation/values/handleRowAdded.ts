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

import type { Action } from "typescript-fsa";

import { DocumentPath } from "../../core/api/path/documentPath.js";
import type { DataActions } from "../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape, ReducerSignature } from "../../redux/api/types.js";
import { assertObject } from "../../typeguards.js";

import { ValidationConfig } from "../validation-computation/validationConfig/validationConfig.js";

import { createNewGroupInstance } from "./addRow/createNewGroupInstance.js";
import { changeValue } from "./changeValue/changeValue.js";
import { documentAndModelsForChange } from "./documentAndModelsForChange.js";
import { updateDocumentInDg } from "./updateDocumentInDg.js";

export function handleRowAdded(): ReducerSignature<DataActions.RowAddedPayload> {
	return (
		dataHolder: DgClAndValidationDataHolderShape,
		action: Action<DataActions.RowAddedPayload>
	) => {
		assertObject(dataHolder.data);

		const { dataReference, indexFieldValue } = action.payload;
		const { document, docRef, dm, fm, notRelevantConfigs, computedFields } =
			documentAndModelsForChange(dataHolder.data);

		const { groupInstanceDocumentPath, groupInstance } = createNewGroupInstance(
			dataHolder,
			docRef,
			dataReference,
			DocumentPath.fromString(dataReference),
			dm,
			fm,
			indexFieldValue
		);

		const changeResult = changeValue(
			document,
			docRef,
			DocumentPath.toString(groupInstanceDocumentPath),
			groupInstance,
			undefined,
			dataHolder.data.validation,
			dm,
			fm,
			notRelevantConfigs,
			computedFields
		);

		return {
			...dataHolder,
			data: {
				...dataHolder.data,
				...updateDocumentInDg(dataHolder.data, changeResult.document, docRef),
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
