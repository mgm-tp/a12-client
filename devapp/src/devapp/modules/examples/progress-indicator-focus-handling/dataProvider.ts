// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { delay, put } from "typed-redux-saga";

import type { DataProvider } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export const FocusHandlingProgressIndicatorDataProvider: DataProvider = {
	name: "FocusHandlingProgressIndicatorDataProvider",
	canHandle({ dataHolder: { descriptor }, operation }) {
		return (
			operation === "load" &&
			descriptor.feature === "FocusHandlingProgressIndicator" &&
			descriptor.instance !== undefined
		);
	},
	*provideData({ activityId, operation }): SagaGenerator<void> {
		if (operation === "load") {
			yield* delay(3000);

			yield* put(ActivityActions.setData({ activityId, data: { information: "Data" } }));
		}
	}
};
