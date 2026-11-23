// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "../../../core/activity/index.js";
import type { DataEditor } from "../../../core/data/index.js";

export interface AuthorData {
	document: string;
}

export interface BookData {
	document: string;
}

export class MockDataEditor implements DataEditor<AuthorData, BookData> {
	meta: DataEditor.Meta;
	constructor(additionalId = "") {
		this.meta = {
			name: `BookDataEditor${additionalId}`,
			childMatchConditions: [
				{
					key: "model",
					mustEqual: `Book${additionalId}`
				},
				{
					key: "instance",
					isSet: true
				}
			],
			parentMatchConditions: [
				{
					key: "model",
					mustEqual: `BookAuthor${additionalId}`
				},
				{
					key: "instance",
					isSet: true
				}
			]
		};
	}

	read(parentActivity: Activity, child: Activity.Descriptor): BookData {
		return { document: "document" };
	}

	write(parentActivity: Activity, childAd: Activity.Descriptor, childData: BookData): AuthorData {
		return { document: "author" };
	}
}

export const mockDataEditor = new MockDataEditor();
