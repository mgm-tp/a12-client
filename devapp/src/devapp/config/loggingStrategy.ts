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

/**
 * Logging configuration for development.
 */

import { LogLevel } from "@com.mgmtp.a12.utils/utils-logging/lib/api.js";
import { ConsoleLoggingStrategy } from "@com.mgmtp.a12.utils/utils-logging/lib/strategy/ConsoleStrategies.js";

export class DynamicConsoleLoggingStrategy extends ConsoleLoggingStrategy {
	private static readonly LocalStorageKey = "logLevel";

	private static readonly LogLevelMap: { readonly [key: string]: LogLevel | undefined } = {
		TRACE: LogLevel.TRACE,
		LOG: LogLevel.LOG,
		INFO: LogLevel.INFO,
		WARN: LogLevel.WARN,
		ERROR: LogLevel.ERROR
	};

	private static getLogLevel(): LogLevel | undefined {
		const logLevelName = localStorage.getItem(this.LocalStorageKey);
		return logLevelName ? this.LogLevelMap[logLevelName.toUpperCase()] : undefined;
	}

	constructor() {
		const logLevel = DynamicConsoleLoggingStrategy.getLogLevel();
		super(console, logLevel ?? LogLevel.INFO);
	}

	digest(
		namespace: string,
		level: LogLevel,
		date: Date,
		message?: unknown,
		...optionalParams: unknown[]
	): void {
		// Enable dynamic log
		const logLevel = DynamicConsoleLoggingStrategy.getLogLevel();
		if (logLevel !== undefined) {
			this.logLevel = logLevel;
		}
		super.digest(namespace, level, date, message, ...optionalParams);
	}
}
