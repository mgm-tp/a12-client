// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActivitySelectors, type Activity } from "@com.mgmtp.a12.client/client-core";

// the activity that describes the example
export const FRAME_DESCRIPTOR = { example: "DataSagasFrame" };
export function isFrameDescriptor(descriptor?: Activity.Descriptor) {
	return descriptor?.example === FRAME_DESCRIPTOR.example;
}

export function selectFrameActivity(state: object): Activity | undefined {
	return Object.values(ActivitySelectors.activities()(state)).find(a =>
		isFrameDescriptor(a?.descriptor)
	);
}

// the activity that actually contains the dataholders
export const EXAMPLE_DESCRIPTOR = { example: "DataSagas", id: "0" };
export function isExampleDescriptor(descriptor?: Activity.Descriptor) {
	return descriptor?.example === EXAMPLE_DESCRIPTOR.example;
}

export function selectExampleActivity(state: object): Activity | undefined {
	return Object.values(ActivitySelectors.activities()(state)).find(a =>
		isExampleDescriptor(a?.descriptor)
	);
}
