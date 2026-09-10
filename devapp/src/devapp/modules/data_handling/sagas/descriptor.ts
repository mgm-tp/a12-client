/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
