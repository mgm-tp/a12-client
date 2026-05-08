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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
