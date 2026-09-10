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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
