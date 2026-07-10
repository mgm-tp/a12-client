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

import type { ModelReference } from "@com.mgmtp.a12.base/base-model-api";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";

import type { Model } from "./Model.js";

/**
 * Expands a given list of model descriptors by adding their referenced models.
 * For each model, references are recursively looked up via modelgraph.
 *
 * @internal
 */
export function expandDescriptors(
	modelDescriptors: Model.Descriptor[],
	modelGraph: ModelGraph
): Model.Descriptor[] {
	const expandedDescriptors = modelDescriptors.reduce(
		(newDescriptors, modelDescriptor) =>
			newDescriptors.concat(expandRecursive(modelGraph, modelDescriptor)),
		[] as Model.Descriptor[]
	);

	return removeDuplicateDescriptors(expandedDescriptors);
}

/**
 * Expands a single descriptor into a list of descriptors.
 *
 * When the given `modelGraph` is empty or contains no references, the resulting list
 * will contain the given descriptor as its only element.
 *
 * NOTE: A valid modelgraph is assumed (cyclic model references are not handled)
 */
function expandRecursive(
	modelGraph: ModelGraph,
	modelDescriptor: Model.Descriptor
): Model.Descriptor[] {
	const expandedDescriptors = [modelDescriptor];

	const referencedModels = findModelReferences(modelDescriptor, modelGraph);

	const referencedDescriptors = referencedModels?.flatMap(r =>
		expandRecursive(modelGraph, {
			name: r.reference,
			modelType: r.modelType
		})
	);

	return expandedDescriptors.concat(referencedDescriptors ?? []);
}

/**
 * For a given Model.Descriptor, finds all (directly) referenced models
 * by looking up the model in the corresponding section of the modelgraph.
 *
 * NOTES:
 * - DMs are split into two groups (normal and CDM)
 * - RMs are stored as-is (therefore references need to be read from their header)
 */
function findModelReferences(
	{ modelType, name }: Model.Descriptor,
	modelGraph: ModelGraph
): readonly ModelReference[] | undefined {
	const match =
		modelType === "document"
			? [...modelGraph.documentModels, ...modelGraph.composeDocumentModels].find(
					dm => dm.modelId === name
				)
			: modelType === "relationship"
				? modelGraph.relationshipModels.find(rm => rm.header.id === name)
				: modelGraph.genericModels?.find(m => m.modelId === name);

	// DS does not provide typeguards for this (A12S-4623)
	return match && "header" in match ? match.header.modelReferences : match?.modelReferences;
}

function removeDuplicateDescriptors(modelDescriptors: Model.Descriptor[]): Model.Descriptor[] {
	const uniqueDescriptorsByName = new Map(modelDescriptors.map(md => [md.name, md]));

	return [...uniqueDescriptorsByName.values()];
}
