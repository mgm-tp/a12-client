// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

export function mockDocumentModel(): Model.DocumentAndValidationModel {
	const header = {} as unknown as DmHeader;
	const content: DmContent = {
		modelConfig: {
			timeZone: "unused"
		},
		modelInfo: {},
		modelRoot: {
			id: "G0",
			name: "root",
			type: "Group",
			repeatability: 1,
			elements: [
				{
					id: "G1",
					name: "base",
					type: "Group",
					repeatability: 1,
					elements: [
						{
							id: "G2",
							name: "aGroup",
							type: "Group",
							repeatability: 99,
							elements: [
								{
									id: "F1",
									name: "aField",
									type: "Field",
									fieldType: {
										type: "StringType"
									}
								}
							]
						},
						{
							id: "G3",
							name: "aUniqueGroup",
							type: "Group",
							repeatability: 1,
							elements: [
								{
									id: "F2",
									name: "anotherField",
									type: "Field",
									fieldType: {
										type: "StringType"
									}
								}
							]
						}
					]
				}
			]
		}
	};
	const generatedCodeAccessor = "unused" as unknown as IGeneratedCodeAccessor;
	return {
		header,
		content,
		generatedCodeAccessor
	};
}

type DmHeader = Model.DocumentAndValidationModel["header"];
type DmContent = Model.DocumentAndValidationModel["content"];
