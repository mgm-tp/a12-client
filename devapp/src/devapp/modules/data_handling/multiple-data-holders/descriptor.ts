// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

export const EXAMPLE_DESCRIPTOR = { feature: "MultipleDataHolders" };

export function isExampleDescriptor(descriptor: Activity.Descriptor) {
	return descriptor.feature === EXAMPLE_DESCRIPTOR.feature;
}
