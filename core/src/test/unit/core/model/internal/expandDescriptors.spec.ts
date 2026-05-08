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

import { deepStrictEqual } from "node:assert/strict";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";
import type { RelationshipModel } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/RelationshipModel.js";

import { expandDescriptors } from "../../../../../core/model/internal/expandDescriptors.js";

const mockModelGraph: ModelGraph = {
	composeDocumentModels: [
		{
			modelId: "CDM1",
			displayLabels: [],
			rootDocumentModelId: "D1"
		},
		{
			modelId: "CDM2",
			displayLabels: [],
			rootDocumentModelId: "D2"
		}
	],
	documentModels: [
		{
			modelId: "D1",
			relations: [],
			subTypes: []
		},
		{
			modelId: "D2",
			relations: [],
			subTypes: []
		},
		{
			modelId: "D3",
			relations: [],
			subTypes: []
		},
		{
			modelId: "D4",
			relations: [],
			subTypes: []
		}
	],
	genericModels: [
		{
			modelId: "F1",
			modelReferences: [
				{
					modelType: "document",
					reference: "D1",
					purpose: "data binding"
				},
				{
					modelType: "overview",
					purpose: "bindingReference",
					reference: "O1"
				},
				{
					modelType: "form",
					purpose: "bindingReference",
					reference: "F2"
				}
			],
			type: "form"
		},
		{
			modelId: "O1",
			modelReferences: [
				{
					modelType: "document",
					reference: "D2",
					purpose: "document-model-for-overview"
				}
			],
			type: "overview"
		},
		{
			modelId: "F2",
			modelReferences: [
				{
					modelType: "document",
					reference: "CDM1",
					purpose: "data binding"
				}
			],
			type: "form"
		},
		{
			modelId: "O2",
			modelReferences: [
				{
					modelType: "document",
					reference: "D3",
					purpose: "document-model-for-overview"
				}
			],
			type: "overview"
		},
		{
			modelId: "F3",
			modelReferences: [
				{
					modelType: "document",
					reference: "CDM2",
					purpose: "data binding"
				}
			],
			type: "form"
		}
	],
	relationshipModels: [
		{
			header: {
				id: "R1",
				modelType: "relationship",
				modelVersion: "3",
				modelReferences: [
					{
						reference: "D4",
						modelType: "document",
						purpose: "link document model"
					}
				]
			},
			content: {} as RelationshipModel["content"]
		}
	]
};

describe("core.model.internal", () => {
	describe("expandDescriptors", () => {
		it("when given an empty model graph, returns the descriptors unchanged", () => {
			const descriptors = [
				{
					modelType: "document",
					name: "A"
				},
				{ modelType: "form", name: "B" },
				{ modelType: "overview", name: "C" },
				{ modelType: "relationship", name: "D" }
			];

			const result = expandDescriptors(descriptors, {
				composeDocumentModels: [],
				documentModels: [],
				genericModels: [],
				relationshipModels: []
			});

			deepStrictEqual(result, descriptors);
		});

		describe("when given a complete modelgraph containing references", () => {
			it("returns all descriptors that are referenced directly and/or indirectly", () => {
				const result = expandDescriptors(
					[
						{ modelType: "form", name: "F1" },
						{ modelType: "relationship", name: "R1" }
					],
					mockModelGraph
				);

				deepStrictEqual(result, [
					{ modelType: "form", name: "F1" },
					{ modelType: "document", name: "D1" },
					{ modelType: "overview", name: "O1" },
					{ modelType: "document", name: "D2" },
					{ modelType: "form", name: "F2" },
					{ modelType: "document", name: "CDM1" },
					{ modelType: "relationship", name: "R1" },
					{ modelType: "document", name: "D4" }
				]);
			});
		});
	});
});
