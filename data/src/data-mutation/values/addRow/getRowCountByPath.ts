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

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import type { FieldInstanceValue, GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade";

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
