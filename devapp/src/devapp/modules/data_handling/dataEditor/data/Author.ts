// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Book } from "./Book.js";

export interface AuthorDocument {
	readonly id: string;
	readonly modelId: string;
	readonly Author: Author;
}

export interface Author {
	readonly name: string;
	readonly surname: string;
	readonly Books?: Book[];
}
