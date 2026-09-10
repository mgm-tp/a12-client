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

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import { call } from "redux-saga/effects";

import { DeepLinkingFactories } from "../../../../extensions/deep-linking/index.js";
import {
	applyDeepLink,
	clearDeepLink,
	updateDeepLink
} from "../../../../extensions/deep-linking/internal/deepLinkingSagas.js";

describe("extensions.deep-linking.factories", () => {
	describe("createSagas", () => {
		const config: DeepLinkingFactories.Configuration = {};

		describe("given a minimal Configuration returns an array of three anonymous sagas,", () => {
			const sagas = DeepLinkingFactories.createSagas(config);

			it("of which the first starts the internal DeepLinkingSagas.updateDeepLink saga with the Configuration", () => {
				const firstSaga = sagas[0]();
				deepStrictEqual(firstSaga.next().value, call(updateDeepLink, config));
				strictEqual(firstSaga.next().done, true);
			});

			it("and the second starts the internal DeepLinkingSagas.clearDeepLink saga with the Configuration", () => {
				const secondSaga = sagas[1]();
				deepStrictEqual(secondSaga.next().value, call(clearDeepLink, config));
				strictEqual(secondSaga.next().done, true);
			});

			it("and the second starts the internal DeepLinkingSagas.applyDeepLink saga with the Configuration", () => {
				const secondSaga = sagas[2]();
				deepStrictEqual(secondSaga.next().value, call(applyDeepLink, config));
				strictEqual(secondSaga.next().done, true);
			});
		});

		describe(
			"not given any parameter - therefore using a default Configuration only with a deepLinkCoder - " +
				"returns an array of two anonymous sagas,",
			() => {
				const sagas = DeepLinkingFactories.createSagas();

				it(
					"of which the first starts the internal updateDeepLink saga " +
						"with the default Configuration",
					() => {
						const firstSaga = sagas[0]();
						deepStrictEqual(firstSaga.next().value, call(updateDeepLink, config));
					}
				);

				it(
					"and the second starts the internal clearDeepLink saga " +
						"with the default Configuration",
					() => {
						const secondSaga = sagas[1]();
						deepStrictEqual(secondSaga.next().value, call(clearDeepLink, config));
					}
				);

				it(
					"and the second starts the internal applyDeepLink saga " +
						"with the default Configuration",
					() => {
						const secondSaga = sagas[2]();
						deepStrictEqual(secondSaga.next().value, call(applyDeepLink, config));
					}
				);
			}
		);
	});
});
