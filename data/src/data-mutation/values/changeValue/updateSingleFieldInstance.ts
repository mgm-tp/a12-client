// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	Document,
	EntityInstancePath,
	FieldInstanceValue,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocServiceFactory } from "../../validation-computation/docServiceFactory.js";

// TODO: internal? not used anywhere else
export function updateSingleFieldInstance(
	document: Document,
	pathOfChangedElement: EntityInstancePath,
	value: readonly GroupInstance[] | Readonly<GroupInstance> | FieldInstanceValue | undefined,
	dm: Model.DocumentAndValidationModel
) {
	return DocServiceFactory.get()
		.getDocumentService()
		.updateEntityInstance(document, pathOfChangedElement, value, dm);
}
