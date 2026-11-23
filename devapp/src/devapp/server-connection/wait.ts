// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Dispatch } from "redux";

import { NotificationActions } from "@com.mgmtp.a12.client/client-core";

import { sleep } from "../utils/sleep.js";

const CHECK_INTERVAL = 5000;

/**
 * The bundler proxies this to "<server>/actuator/health/initializationFinished", which is the recommended endpoint
 * by services to query for "readiness"
 */
const STATUS_ENDPOINT = "/status";

export async function waitForServer(dispatch: Dispatch) {
	if (!(await isReady())) {
		dispatch(
			NotificationActions.add({
				severity: "info",
				title: { key: "server.connection.waiting.title" },
				message: {
					key: "server.connection.waiting.message"
				}
			})
		);

		do {
			await sleep(CHECK_INTERVAL);
		} while (!(await isReady()));
	}
}

async function isReady(): Promise<boolean> {
	try {
		const response = await fetch(STATUS_ENDPOINT);

		const data = await response.json();

		return typeof data === "object" && data !== null && "status" in data && data.status === "UP";
	} catch {
		return false;
	}
}
