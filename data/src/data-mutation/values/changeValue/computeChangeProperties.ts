// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentModel,
	EntityInstancePath
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../../core/api/data-reference.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import { getDataType } from "../../../data-model/dataType.js";

// TODO: internal? not used anywhere else
export function computeChangeProperties(
	documentModel: DocumentModel,
	dataReference: DataReference
): {
	isFieldValueChange: boolean;
	changedElementDataType: string | DocumentModel.FieldType | undefined;
	changedElementPath: EntityInstancePath;
} {
	const changedElementDataType = getDataType(documentModel, dataReference);
	return {
		isFieldValueChange: changedElementDataType !== undefined,
		changedElementDataType,
		changedElementPath: DocumentPath.fromString(dataReference)
	};
}
