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

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";
import type { Localizable, Localizer } from "@com.mgmtp.a12.utils/utils-localization";
import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization";

import { RESOURCE_KEYS } from "./languages/index.js";

/**
 * @experimental
 *
 * Tree item that is displayed in the variant selection UI.
 *
 * The structure and content of the tree in the UI is controlled by this
 * tree. It can differ from the type hierarchy in the Model Graph.
 */
export interface VariantSelectionItem {
	/** Localized label that represents the item */
	readonly label: string;

	/** ID of the respective document model, undefined if variant should not be selectable */
	readonly documentModelId?: string;

	/** Optional sub-items in the tree */
	readonly children?: VariantSelectionItem[];
}

/**
 * @experimental
 *
 * Based on a start type, create a list of items for the variant selection.
 */
export interface VariantSelectionMapper {
	(startType: ModelGraph.DocumentModel): VariantSelectionItem[];
}

/**
 * @experimental
 *
 * Create the default implementation of the variant selection mapper.
 *
 * The mapper works in the following way:
 * - It creates a tree item in the variant selection for each Type in the Model Graph.
 * - The items are nested according to the subType dependency.
 * - It uses the A12 L10n API to compute the label.
 * - Siblings are sorted using their label.
 * - Abstract types yield a variant without documentModelId, effectively disabling it.
 *
 * Note: Due to the lack of a l10n of the label in the models, the Localizables only contain the model ID as default
 * value. This means, that no proper localized labels are provided out of the box, but you can localize them yourself in
 * a custom service.
 */
export function defaultVariantSelectionMapper(
	modelGraph: ModelGraph,
	localizer: Localizer
): VariantSelectionMapper {
	return startType => [...construct(startType, true)];

	function construct(current: ModelGraph.DocumentModel, root?: boolean): VariantSelectionItem[] {
		const children = [];

		if (current.subTypes !== null && current.subTypes.length > 0) {
			for (const subTypeRef of current.subTypes) {
				const subType = modelGraph.documentModels.find(dm => dm.modelId === subTypeRef);
				if (subType === undefined) {
					throw new Error(`Cannot find type "${subTypeRef}" - corrupt Model Graph?`);
				}
				children.push(...construct(subType));
			}

			children.sort(compareVSILabel);
		}

		return !(root && current.abstractModel)
			? [
					{
						documentModelId: current.abstractModel ? undefined : current.modelId,
						label: localizer(createLocalizable(current)) ?? "",
						children: children.length > 0 ? children : undefined
					}
				]
			: children;
	}
}

function createLocalizable(current: ModelGraph.DocumentModel): Localizable {
	return localizableFromModel(
		RESOURCE_KEYS.variant_selection.variant_label,
		current.displayLabels ?? [
			{ locale: "en", text: "$modelId$" },
			{ locale: "de", text: "$modelId$" }
		],
		{
			modelId: {
				type: "plain",
				value: current.modelId
			}
		}
	);
}

function compareVSILabel(v1: VariantSelectionItem, v2: VariantSelectionItem): number {
	return v1.label.localeCompare(v2.label);
}
