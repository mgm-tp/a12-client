// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
