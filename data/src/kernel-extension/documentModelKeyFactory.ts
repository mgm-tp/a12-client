// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { localizableKeyFromSegments } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

/**
 * Copied from the Form Engine to ensure that keys are generated equally.
 *
 * TODO: Should be moved to the Kernel
 */
export namespace DocumentModelKeyFactory {
	export function createKey(
		modelId: string,
		type: string,
		path: ModelPath,
		suffix?: string
	): string {
		const segments = ["documentModel", type, modelId, ...path.map(e => e.elementName)];
		if (suffix) {
			segments.push(suffix);
		}
		return localizableKeyFromSegments(segments);
	}
}
