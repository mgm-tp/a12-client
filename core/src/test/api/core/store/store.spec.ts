// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/index.js";

import { StoreFactories } from "../../../../core/store/index.js";
import { createStoreForTest } from "../../../unit/core/frame/utils.js";

const logger = LoggerFactory.getLogger("core/store");

describe("core.store.factories", () => {
	describe("createMiddleware", () => {
		describe(
			"Given a function with the redux MiddlewareAPI, the redux dispatch function and an action " +
				"as parameters and an action as return value",
			() => {
				it("returns conveniently a function applicable as redux middleware", () => {
					const dummyAction = { type: "dummy", payload: "Hiho" };

					const dummyMiddleware = StoreFactories.createMiddleware((api, next, action) => {
						if (action === dummyAction) {
							action.payload = "Hihi";
							return next(action);
						}
						return next(action);
					});
					const store = createStoreForTest({ additionalMiddlewares: [dummyMiddleware] });

					store.dispatch(dummyAction);

					const changedPayload = store.getActions().find(a => a.type === dummyAction.type)?.payload;

					strictEqual(changedPayload, "Hihi");
				});
			}
		);
	});
});

describe("core.store.middlewares", () => {
	describe("logging", () => {
		describe("given the logging function applied as redux middleware", () => {
			describe("and an action dispatched to the store", () => {
				it("logs the start and end of the dispatching process", () => {
					const logStub = mock.method(logger, "trace");

					const store = createStoreForTest();

					const action = { type: "dummy" };
					store.dispatch(action);

					const callArgs = logStub.mock.calls;

					strictEqual(
						callArgs.some(
							({ arguments: [text, type] }) => text === ">>> START ACTION" && type === action.type
						),
						true
					);
					strictEqual(
						callArgs.some(
							({ arguments: [text, type] }) => text === "<<< END ACTION" && type === action.type
						),
						true
					);
				});
			});
		});
	});
});
