// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	DocumentModel,
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";
import { applyDataContext } from "../../core/api/path/documentPathWithAllRepetitions.js";
import type { ComputedFields } from "../../internal/documentGraph.js";

/**
 * A function that expands all the computed fields referenced in a validation message
 */
export function expandComputedFields(
	messages: Message[],
	documentModel: DocumentModel,
	computedFields?: ComputedFields,
	mode?: "replace"
): Message[] {
	if (!computedFields) {
		return messages;
	}

	return messages.map(message => {
		return {
			...message,
			referencedFields: expandComputedField(
				message.referencedFields,
				documentModel,
				computedFields,
				mode
			),
			refOmissionErrorResponsible: expandComputedField(
				message.refOmissionErrorResponsible,
				documentModel,
				computedFields,
				mode
			)
		};
	});
}

export function expandComputedField(
	fields: EntityInstancePath[],
	documentModel: DocumentModel,
	computedFields: ComputedFields,
	mode?: "replace"
): EntityInstancePath[] {
	return fields.reduce((acc: EntityInstancePath[], field) => {
		const fieldModelPath = ModelPath.toString(field);
		if (fieldModelPath in computedFields) {
			const nonComputedRelatedFields = computedFields[fieldModelPath];

			/**
			 * TODO: Determine if we can always use the data context of the iterated field
			 *  or should use the data context of the entityInstance in the validation message
			 */
			const operatorsWith0Indices = applyDataContext(
				documentModel,
				nonComputedRelatedFields.map(ModelPath.fromString),
				DocumentPath.toString(field)
			);

			operatorsWith0Indices.forEach(operatorPath => {
				if (!acc.some(refField => DocumentPath.equal(refField, operatorPath))) {
					acc.push(operatorPath);
				}
			});

			if (mode === "replace") {
				return acc;
			}
		}

		if (!acc.some(refField => DocumentPath.equal(refField, field))) {
			acc.push(field);
		}
		return acc;
	}, []);
}
