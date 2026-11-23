// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DgDocument } from "../../../../internal/documentGraph.js";

import { mockDocument } from "./mockDocument.js";
import { mockDocumentModel } from "./mockDocumentModel.js";

export function mockDgDocument(): DgDocument {
	return {
		docRef: "foo/1",
		document: mockDocument(),
		documentModel: mockDocumentModel(),
		loadingState: "loaded"
	};
}
