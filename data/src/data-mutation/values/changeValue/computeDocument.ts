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
import type { ExternalComputation } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type {
	Document,
	DocumentModel,
	EntityInstancePath,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { FormModel } from "../../../core/api/model/form-model.js";
import { DocumentRuntimeServiceFactory } from "../../validation-computation/validationRuntimeService.js";

import { convertDependencies } from "./externalComputation.js";

export function computeDocument(params: {
	dm: Model.DocumentAndValidationModel;
	fm: FormModel | undefined;
	document: GroupInstance;
	change?: {
		elementDataType: DocumentModel.FieldType | string | undefined;
		elementPath: EntityInstancePath;
	};
}) {
	const { dm, fm, document, change } = params;
	const documentRtService = DocumentRuntimeServiceFactory.get().createDocumentRtService(
		dm.generatedCodeAccessor,
		{ ignoreUnknownFields: true }
	);
	const externalComputations: ExternalComputation[] = fm ? convertDependencies(fm, dm) : [];

	// we exclude changes to multi-select or attachment "fields" here since they cannot trigger dependencies anyway
	// therefore, we exclude strings that are used for the usageType of groups
	const isActualDmFieldDataType = typeof change?.elementDataType === "object";
	const computationResult = documentRtService?.computeA12internal(
		document as Document,
		externalComputations,
		change && isActualDmFieldDataType ? [change.elementPath] : undefined
	);

	const computedDocument = computationResult.appliedTo(document as Document) as GroupInstance;

	return {
		computationResult,
		computedDocument: computedDocument as Document
	};
}
