// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
