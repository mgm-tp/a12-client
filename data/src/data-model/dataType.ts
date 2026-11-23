// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../core/api/data-reference.js";
import { DocumentPath } from "../core/api/path/documentPath.js";
import { DocServiceFactory } from "../data-mutation/validation-computation/docServiceFactory.js";

// TODO: internal? not used anywhere else
/**
 * @param dataHolder
 * @param dataRef
 * @returns the field data type for the given DataReference if it is a field, or the (optional) usage type of the group otherwise
 */
export function getDataType(
	documentModel: DocumentModel,
	dataRef: DataReference
): DocumentModel.FieldType | string | undefined {
	// FIXME: select DM from models slice instead of using reference in DG document -> requires additional function parameter
	const element = DocServiceFactory.get()
		.getDocumentModelSearchService(documentModel)
		.getByPath(DocumentPath.fromString(dataRef));

	if (element?.type === "Field") {
		return element.fieldType;
	} else {
		return element?.usageType;
	}
}
