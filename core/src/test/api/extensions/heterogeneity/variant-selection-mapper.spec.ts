// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";
import type { Localizer } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { defaultLocalizerFactory } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import type { VariantSelectionItem } from "../../../../extensions/heterogeneity/index.js";
import {
	defaultVariantSelectionMapper,
	HETEROGENEITY_RESOURCE_KEYS
} from "../../../../extensions/heterogeneity/index.js";
import { KEY_OUTPUT_LOCALIZER, US_LOCALE } from "../../../utils/localization.js";

describe("extensions.heterogeneity", () => {
	describe("variant-selection-mapper", () => {
		describe("defaultVariantSelectionMapper provides a mapper that", () => {
			it("maps a tree of document models to a structurally identical tree of variants without root if the root is abstract", () => {
				const variants = map(MODEL_TREE_WITH_ABSTRACT_ROOT);
				strictEqual(variants.length, 3);
				strictEqual(variants[0].children, undefined);
				strictEqual(variants[1].children, undefined);
				strictEqual(variants[2].children, undefined);
				strictEqual(
					variants.some(c => c.documentModelId === "Child1"),
					true
				);
				strictEqual(
					variants.some(c => c.documentModelId === "Child2"),
					true
				);
				strictEqual(
					variants.some(c => c.documentModelId === undefined),
					true
				);
			});

			it("maps a tree of document models to a structurally identical tree of variants with root if the root is not abstract", () => {
				const variants = map(MODEL_TREE_WITHOUT_ABSTRACT_ROOT);
				strictEqual(variants.length, 1);
				strictEqual(variants[0].children?.length, 3);
				strictEqual(variants[0].children[0].children, undefined);
				strictEqual(variants[0].children[1].children, undefined);
				strictEqual(variants[0].children[2].children, undefined);
				strictEqual(
					variants[0].children.some(c => c.documentModelId === "Child1"),
					true
				);
				strictEqual(
					variants[0].children.some(c => c.documentModelId === "Child2"),
					true
				);
				strictEqual(
					variants[0].children.some(c => c.documentModelId === undefined),
					true
				);
			});

			it("uses the key HETEROGENEITY_RESOURCE_KEYS.variant_selection.variant_label to localize the labels", () => {
				const variants = map(MODEL_TREE_WITHOUT_ABSTRACT_ROOT, KEY_OUTPUT_LOCALIZER);
				strictEqual(variants[0].label, HETEROGENEITY_RESOURCE_KEYS.variant_selection.variant_label);
				strictEqual(variants[0].children?.length, 3);
				strictEqual(
					variants[0].children[0].label,
					HETEROGENEITY_RESOURCE_KEYS.variant_selection.variant_label
				);
				strictEqual(
					variants[0].children[1].label,
					HETEROGENEITY_RESOURCE_KEYS.variant_selection.variant_label
				);
				strictEqual(
					variants[0].children[2].label,
					HETEROGENEITY_RESOURCE_KEYS.variant_selection.variant_label
				);
			});

			it("uses the model IDs as (default) label", () => {
				const variants = map(MODEL_TREE_WITHOUT_ABSTRACT_ROOT);
				strictEqual(variants[0].label, "0");
				strictEqual(variants[0].children?.length, 3);
				strictEqual(
					variants[0].children.some(c => c.label === "1"),
					true
				);
				strictEqual(
					variants[0].children.some(c => c.label === "2"),
					true
				);
				strictEqual(
					variants[0].children.some(c => c.label === "3"),
					true
				);
			});

			it("sorts the result by label", () => {
				const variants = map(MODEL_TREE_WITHOUT_ABSTRACT_ROOT);
				strictEqual(variants[0].children?.length, 3);
				strictEqual(variants[0].children[0].label, "1");
				strictEqual(variants[0].children[1].label, "2");
				strictEqual(variants[0].children[2].label, "3");
			});

			it(
				"abstract document models yield variants without documentModelId" +
					" and concrete document models yield variants with documentModelId",
				() => {
					const variants = map(MODEL_TREE_WITHOUT_ABSTRACT_ROOT);
					strictEqual(variants[0].documentModelId, "Root");
					strictEqual(variants[0].children?.length, 3);
					strictEqual(variants[0].children[0].documentModelId, "Child1");
					strictEqual(variants[0].children[1].documentModelId, "Child2");
					strictEqual(variants[0].children[2].documentModelId, undefined); // Child3 is abstract
				}
			);
		});
	});
});

function map(graph: ModelGraph, localizer?: Localizer): VariantSelectionItem[] {
	const mapper = defaultVariantSelectionMapper(
		graph,
		localizer ?? defaultLocalizerFactory({ locale: US_LOCALE })
	);
	return mapper(graph.documentModels.find(dm => dm.modelId === "Root")!);
}

const MODEL_TREE_WITHOUT_ABSTRACT_ROOT: ModelGraph = {
	documentModels: [
		entry("Child2", "2", false),
		entry("Root", "0", false, ["Child1", "Child2", "Child3"]),
		entry("Child1", "1", false),
		entry("Child3", "3", true)
	],
	relationshipModels: [],
	composeDocumentModels: []
};

const MODEL_TREE_WITH_ABSTRACT_ROOT: ModelGraph = {
	documentModels: [
		entry("Child2", "2", false),
		entry("Root", "0", true, ["Child1", "Child2", "Child3"]),
		entry("Child1", "1", false),
		entry("Child3", "3", true)
	],
	relationshipModels: [],
	composeDocumentModels: []
};

function entry(
	modelId: string,
	text: string,
	abstractModel: boolean,
	subTypes: string[] = []
): ModelGraph.DocumentModel {
	return {
		modelId,
		displayLabels: [{ locale: "en", text }],
		abstractModel,
		subTypes,
		relations: []
	};
}
