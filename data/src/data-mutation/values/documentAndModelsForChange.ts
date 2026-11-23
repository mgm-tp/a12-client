// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
