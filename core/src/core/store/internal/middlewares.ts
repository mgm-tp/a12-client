// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { StoreFactories } from "./factories.js";

const logger = LoggerFactory.getLogger("core/store");

export namespace StoreMiddlewares {
	/**
	 * redux middleware provider function, which returns a middleware to generate log entries before and after
	 * an action is dispatched
	 *
	 * @returns the logging middleware
	 */
	export function logging(): Middleware {
		return StoreFactories.createMiddleware((_api, next, action) => {
			logger.trace(">>> START ACTION", action.type);
			const retVal = next(action);
			logger.trace("<<< END ACTION", action.type);
			return retVal;
		});
	}
}
