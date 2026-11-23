// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import { DataLoader } from "@com.mgmtp.a12.client/client-core";

class CommitErrorDataLoader implements DataLoader<{}> {
	private fail = false;

	constructor(protected readonly meta: DataLoader.Meta) {}

	load(): Promise<{}> {
		return Promise.resolve({});
	}
	save(): Promise<{}> {
		this.fail = !this.fail;
		if (this.fail) {
			return Promise.reject({
				errorCode: "COMMIT_FAILED",
				errorMessage: "Connection to server failed."
			});
		} else {
			return Promise.resolve({});
		}
	}

	delete(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	get name(): string {
		return this.meta.name;
	}

	canHandle(ad: Activity.Descriptor): boolean {
		return DataLoader.canHandle(this.meta, ad);
	}
}

export const commitErrorDataLoader: DataLoader = new CommitErrorDataLoader({
	name: "CommitErrorDataLoader",
	matchConditions: [
		{
			key: "section",
			mustEqual: "ErrorHandling"
		},
		{
			key: "feature",
			mustEqual: "CommitErrorHandling"
		}
	]
});
