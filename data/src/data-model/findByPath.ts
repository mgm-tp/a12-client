// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocServiceFactory } from "../data-mutation/validation-computation/docServiceFactory.js";

/* FIXME: should be internal, but is used in uiflows */
export function findByPath(
	documentModel: DocumentModel,
	targetPath: ModelPath
): DocumentModel.Element {
	if (targetPath.length === 0) {
		return documentModel.content.modelRoot;
	}

	const element = DocServiceFactory.get()
		.getDocumentModelSearchService(documentModel)
		.getByPath(targetPath);

	if (element === undefined) {
		throw new Error(`Invalid path: ${ModelPath.toString(targetPath)}`);
	}

	return element;
}
