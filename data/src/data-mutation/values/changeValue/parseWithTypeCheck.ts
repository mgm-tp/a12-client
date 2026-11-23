// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { Document } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../../core/api/data-reference.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import type { KernelTypes } from "../../types.js";
import { DocServiceFactory } from "../../validation-computation/docServiceFactory.js";
import { KernelMessage } from "../../validation-computation/message.js";
import type { ParseError } from "../../validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../validation-computation/validatorProviderFactory.js";

export interface ParseResult {
	readonly type: "success" | "error";
	readonly value?: KernelTypes.Value;
	readonly error?: ParseError;
}

export function parseWithTypeCheck(
	dataRef: DataReference,
	dm: Model.DocumentAndValidationModel,
	value: KernelTypes.Value,
	userValue?: string
): ParseResult {
	const documentPath = DocumentPath.fromString(dataRef);

	const field = DocServiceFactory.get().getDocumentModelSearchService(dm).getByPath(documentPath);

	if (field?.type !== "Field") {
		return {
			type: "success",
			value
		};
	}

	const documentRtService = DocumentRuntimeServiceFactory.get().createDocumentRtService(
		ValidatorProviderFactory.get().getValidatorProvider(dm),
		{
			ignoreUnknownFields: true
		}
	);

	// simplify the actual path to 1-indices
	const modifiedPath = documentPath.map(entry => ({ ...entry, index: 1 }));
	// set the new value in an empty document with the adjusted path,
	// because the actual path might not work in an empty document if it points to repeatable group instances
	const docWithNewValue = DocServiceFactory.get()
		.getDocumentService()
		.updateEntityInstance({}, modifiedPath, value, dm) as Document;

	// validate only the changed field value and only look at the formal errors
	const newMessages = documentRtService
		.validatePart(docWithNewValue, [modifiedPath])
		.messages // all rule errors will be removed here
		.filter(msg => msg.rulePath === KernelMessage.FORMAL_VALIDATION)
		.map(msg => ({
			...msg,
			// all paths have to be mapped back to the original document path that was mapped to all 1-indices above
			entityInstance: documentPath,
			referencedFields: [documentPath],
			refOmissionErrorResponsible: msg.refOmissionErrorResponsible.length ? [documentPath] : []
		}));

	if (newMessages.length) {
		return {
			type: "error",
			error: {
				value: userValue ?? "",
				message: newMessages[0]
			}
		};
	} else {
		return {
			type: "success",
			value
		};
	}
}
