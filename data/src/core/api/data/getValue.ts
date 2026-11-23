// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentModel,
	EntityInstancePath,
	FieldInstanceValue,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { getModelElement } from "../../../data-model/getModelElement.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";

import type { DataReference } from "../data-reference.js";
import { DocumentPath } from "../path/documentPath.js";

export function getValue(
	document: GroupInstance,
	dataReference: DataReference
): GroupInstance[] | GroupInstance | FieldInstanceValue | undefined {
	return documentValueFromPath(document, DocumentPath.fromString(dataReference));
}

/* FIXME: should be internal, but is used in uiflows */
export function fieldValueAccessorForDocument(
	document: GroupInstance,
	dm: DocumentModel
): (path: EntityInstancePath) => FieldInstanceValue | undefined {
	return (path: EntityInstancePath) => {
		const targetElement = getModelElement(dm, path);
		if (targetElement?.type === "Group") {
			throw new Error(`The given path [${path}] points to a group instance.`);
		}
		return documentValueFromPath(document, path) as FieldInstanceValue | undefined;
	};
}

function documentValueFromPath(document: GroupInstance, docPath: EntityInstancePath) {
	try {
		return DocServiceFactory.get().getDocumentService().getAssignedObject(document, docPath);
	} catch (error) {
		throw new Error(
			`Critical error: Cannot return a value for the invalid document path '${DocumentPath.toString(
				docPath
			)}'.`,
			{ cause: error }
		);
	}
}
