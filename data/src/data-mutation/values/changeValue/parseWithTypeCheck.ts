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
import type { Document, GeneratedCodeRtConfig } from "@com.mgmtp.a12.kernel/kernel-md-facade";

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
	userValue?: string,
	kernelOptions?: GeneratedCodeRtConfig
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
			ignoreUnknownFields: true,
			...kernelOptions
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
