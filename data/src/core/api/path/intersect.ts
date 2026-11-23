// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

/** @internal */
export function intersect(modelPath: ModelPath, context: EntityInstancePath): EntityInstancePath {
	const index = context
		.slice(0, modelPath.length)
		.findIndex((e, i) => e.elementName !== modelPath[i].elementName);
	return context.slice(0, index >= 0 ? index : modelPath.length);
}
