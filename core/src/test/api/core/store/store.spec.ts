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
