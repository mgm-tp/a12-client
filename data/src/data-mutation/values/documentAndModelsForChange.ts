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
import type { Document } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { FormModel } from "../../core/api/model/form-model.js";
import type { NotRelevantConfig } from "../../core/api/model/relevance/notRelevantConfig.js";
import type { ComputedFields } from "../../internal/documentGraph.js";
import type { DgChangeLogSlice, DgSlice } from "../../internal/slices.js";

export function documentAndModelsForChange(data: DgSlice & DgChangeLogSlice): {
	readonly document: Document;
	readonly docRef: string;
	readonly dm: Model.DocumentAndValidationModel;
	readonly fm?: FormModel;
	readonly notRelevantConfigs: NotRelevantConfig[];
	readonly computedFields: ComputedFields;
} {
	const rootDoc = data.entryPoint;
	if (!rootDoc) {
		throw new Error("Cannot handle changed value without an entry point document.");
	}

	const document = data?.documentGraph.documents.byDocRef[rootDoc];

	if (!document || document.loadingState !== "loaded") {
		throw new Error(
			`Cannot modify document [docRef: ${rootDoc}] that is not in loadingState "loaded".`
		);
	}
	const dm = document.documentModel as Model.DocumentAndValidationModel;
	const fm = document.formModel as FormModel | undefined;

	return {
		document: document.document as Document,
		docRef: rootDoc,
		dm,
		fm,
		notRelevantConfigs: (document.notRelevantConfigs as NotRelevantConfig[]) ?? [],
		computedFields: (document.computedFields as ComputedFields) ?? {}
	};
}
