// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext } from "react";

import {
	defaultVariantSelectionMapper,
	VariantSelection
} from "@com.mgmtp.a12.client/client-core/heterogeneity";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/index.js";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";

const modelGraph: ModelGraph = {
	documentModels: [],
	relationshipModels: [],
	composeDocumentModels: []
};

function handleSelection() {}

export function Example() {
	// tag::example[]
	const localizer = useContext(LocalizerContext).localizer;

	const myStartingType = modelGraph.documentModels.find(dm => dm.modelId === "MyModel");

	if (!myStartingType) {
		throw new Error("Model graph incomplete!");
	}

	const options = defaultVariantSelectionMapper(modelGraph, localizer)(myStartingType);

	return <VariantSelection variants={options} onSelect={handleSelection} />;
	// end::example[]
}
