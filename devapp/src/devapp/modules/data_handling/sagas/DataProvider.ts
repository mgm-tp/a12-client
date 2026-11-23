// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { all, delay, put } from "typed-redux-saga";

import type { DataProvider } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import { dataDeleted } from "./actions.js";
import { isExampleDescriptor } from "./descriptor.js";

export const ExampleProvider: DataProvider = {
	name: "ExampleProvider",
	canHandle({ dataHolder: { descriptor } }) {
		return isExampleDescriptor(descriptor);
	},
	*provideData({ activityId, operation, details, dataHolders }): SagaGenerator<void> {
		yield* delay(3000);
		switch (operation) {
			case "delete": {
				yield* put(dataDeleted({ activityId, dataholderIds: [details.instanceId] }));
				break;
			}
			case "load": {
				yield* all(
					dataHolders.map(dh =>
						put(
							ActivityActions.setDataByDescriptor({
								activityId,
								data: {},
								descriptor: dh.descriptor
							})
						)
					)
				);

				break;
			}
			case "save": {
				const shouldUpdateInstance = dataHolders.some(
					dh => dh.descriptor.id === "0" && dh.slices.updateInstance
				);

				const result = shouldUpdateInstance ? { instance: crypto.randomUUID() } : {};

				yield* put(details.saving.done(result));

				break;
			}
		}
	}
};
