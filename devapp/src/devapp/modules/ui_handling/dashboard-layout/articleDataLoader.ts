// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import { DataLoader } from "@com.mgmtp.a12.client/client-core";

export interface ArticleData {
	readonly text: string;
}

class ArticleDataLoader implements DataLoader<ArticleData> {
	constructor(protected readonly meta: DataLoader.Meta) {}

	load(): Promise<ArticleData> {
		return delay(3500).then(() => ({
			text:
				"Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore" +
				" et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut" +
				" aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore" +
				" eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia" +
				" deserunt mollit anim id est laborum. "
		}));
	}
	save(): Promise<ArticleData> {
		throw new Error("Method not implemented.");
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

function delay(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export const articleDataLoader: DataLoader = new ArticleDataLoader({
	name: "ArticleDataLoader",
	matchConditions: [
		{
			key: "tile",
			mustEqual: "DashboardArticleTile"
		},
		{
			key: "instance",
			isSet: false
		}
	]
});
