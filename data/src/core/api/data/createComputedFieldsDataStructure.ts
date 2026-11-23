// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	IIdentifier,
	IMetaField,
	IMetaModel
} from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/lib/main/js/a12internal/index.js";
import { IMetaKeys } from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/lib/main/js/a12internal/utils/IMetaKeys.js";

import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { ComputedFields } from "../../../internal/documentGraph.js";

// TODO: internal? not used anywhere else
/**
 * A function that creates a data structure which maps all non computed fields related to a computed field
 */
export function createComputedFieldsDataStructure(
	documentModel: Model.DocumentAndValidationModel
): ComputedFields {
	const validatorProvider = ValidatorProviderFactory.get().getValidatorProvider(documentModel);
	const metaModel = validatorProvider.getMetaModel() as IMetaModel;
	const computedFields = metaModel.getValue(IMetaKeys.MODEL_CALC_FIELDS) as Set<IMetaField>;

	return Object.fromEntries(
		[...computedFields].map(computedField => [
			computedField.getValue(IMetaKeys.FIELD_FULLNAME) as string,
			[...new Set(getNonComputedFields(computedField, metaModel, computedFields))]
		])
	);
}

/**
 * A function that recursively collects all fields that are not computed. It starts from a single field
 * and calls itself with the operands of the field again when the provided field is a computed field.
 */
function getNonComputedFields(
	field: IMetaField,
	metaModel: IMetaModel,
	computedFields: Set<IMetaField>
): string[] {
	if (computedFields.has(field)) {
		const computedFieldOperands = field.getValue(IMetaKeys.FIELD_OPERANDS_SET) as Set<IIdentifier>;
		return [...computedFieldOperands].flatMap(operand => {
			return getNonComputedFields(
				metaModel.getValue(IMetaKeys.MODEL_META_FIELD, operand.getName()) as IMetaField,
				metaModel,
				computedFields
			);
		});
	} else {
		return [field.getValue(IMetaKeys.FIELD_FULLNAME) as string];
	}
}
