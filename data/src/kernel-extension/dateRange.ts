// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { KernelTypes } from "../data-mutation/types.js";

export function isDateRangeArray(value: KernelTypes.Value): value is Date[] {
	return Array.isArray(value) && value.length === 2 && value.every(e => e instanceof Date);
}
