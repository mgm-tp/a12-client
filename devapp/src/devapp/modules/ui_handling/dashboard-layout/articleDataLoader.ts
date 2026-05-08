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
