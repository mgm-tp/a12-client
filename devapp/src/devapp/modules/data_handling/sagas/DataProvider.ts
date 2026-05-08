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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
