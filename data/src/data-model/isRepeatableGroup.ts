// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { findByPath } from "./findByPath.js";

/** @internal */
export function isRepeatableGroup(documentModel: DocumentModel, modelPath: ModelPath): boolean {
	const element = findByPath(documentModel, modelPath);
	return element.type === "Group" && element.repeatability > 1;
}
