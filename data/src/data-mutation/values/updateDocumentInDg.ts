// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Document } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { changeDocument } from "../../internal/reducers.js";
import type { DgChangeLogSlice, DgSlice } from "../../internal/slices.js";

import type { ValidationSlice } from "../validation-computation/types.js";

export function updateDocumentInDg(
	data: DgSlice & DgChangeLogSlice & ValidationSlice,
	document: Document,
	docRef: string
) {
	return changeDocument(data, { document, elementRef: docRef });
}
