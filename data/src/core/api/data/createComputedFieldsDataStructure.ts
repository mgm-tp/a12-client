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

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	IIdentifier,
	IMetaField,
	IMetaModel
} from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/a12internal";
import { IMetaKeys } from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/a12internal";

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
