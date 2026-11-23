// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "../../../core/model/index.js";

/** @internal */
export function createNotFoundError(
	{ name }: Model.Descriptor,
	error?: unknown,
	type?: "model" | "validation"
): Model.Error {
	return {
		type: "NOT_FOUND",
		message: `Cannot receive${
			type === "validation" ? " validation file for " : " "
		}model "${name}" from server.`,
		source: error
	};
}
