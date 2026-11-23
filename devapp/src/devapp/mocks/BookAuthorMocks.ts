// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AuthorDocument } from "../modules/data_handling/dataEditor/data/Author.js";

export const BookAuthorMocks: AuthorDocument[] = [
	{
		id: "BookAuthor-document/1",
		modelId: "BookAuthor-document",
		Author: {
			name: "Richard",
			surname: "Morgan",
			Books: [
				{
					BookDetails: {
						id: "Book-document/1",
						title: "Altered carbon",
						publicationYear: 2008
					}
				},
				{
					BookDetails: {
						id: "Book-document/2",
						title: "Market forces",
						publicationYear: 2005
					}
				}
			]
		}
	}
];
