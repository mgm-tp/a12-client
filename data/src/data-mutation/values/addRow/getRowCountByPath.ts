// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import type {
	FieldInstanceValue,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../../core/api/data-reference.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import type { DgSlice } from "../../../internal/slices.js";
import { isSetDgCl } from "../../../redux/api/types.js";
import { DocServiceFactory } from "../../validation-computation/docServiceFactory.js";

export function getRowCountByPath(
	dataHolder: Activity.DataHolder,
	docRef: string,
	dataRef: DataReference
): number {
	if (isSetDgCl(dataHolder.data)) {
		return ((getGroupValue(dataHolder.data, docRef, dataRef) ?? []) as GroupInstance[]).length;
	}
	return 0;
}

function getGroupValue(
	data: DgSlice,
	docRef: string,
	dataRef: DataReference
): GroupInstance[] | GroupInstance | FieldInstanceValue | undefined {
	const document = data.documentGraph.documents.byDocRef[docRef];

	if (!document || document.loadingState !== "loaded") {
		return undefined;
	}
	return DocServiceFactory.get()
		.getDocumentService()
		.getAssignedObject(document.document, DocumentPath.fromString(dataRef));
}
