// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelReference } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

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
