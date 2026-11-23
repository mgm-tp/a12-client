// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import type { SupportedType } from "@com.mgmtp.a12.utils/utils-localization/lib/main/conversion.js";

export namespace KernelTypes {
	export type Value = GroupInstance[] | Readonly<GroupInstance> | SupportedType | undefined;
}
