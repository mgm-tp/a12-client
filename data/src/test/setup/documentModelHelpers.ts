// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

export function createDocumentModel(
	rootGroup: DocumentModel.Group
): Model.DocumentAndValidationModel {
	return {
		header: {} as unknown as Model.DocumentAndValidationModel["header"],
		content: {
			modelRoot: Group({
				elements: [rootGroup]
			}),
			modelInfo: {},
			modelConfig: {
				timeZone: "UTC"
			}
		},
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}

export function Group(group: Partial<Omit<DocumentModel.Group, "type">> = {}): DocumentModel.Group {
	return {
		type: "Group",
		id: "id",
		name: "anyGroup",
		annotations: [],
		elements: [],
		externalDescription: [{ locale: "en", text: "externalDescription" }],
		repeatability: 1,
		...group
	};
}

export function Field(field: Partial<Omit<DocumentModel.Field, "type">> = {}): DocumentModel.Field {
	return {
		type: "Field",
		id: "id",
		name: "anyField",
		annotations: [],
		externalDescription: [{ locale: "en", text: "externalDescription" }],
		fieldType: { type: "StringType", lineBreaksPermitted: false },
		label: [{ locale: "en", text: "label" }],
		...field
	};
}
