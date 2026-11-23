// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
