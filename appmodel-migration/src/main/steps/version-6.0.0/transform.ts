// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { traverseAndUpdateObject } from "../../utils.js";

import type { ApplicationModel } from "../version-5.0.0/ApplicationModel.js";

import type { ApplicationModel as NewApplicationModel } from "./ApplicationModel.js";

export default function migrate(model: ApplicationModel): NewApplicationModel {
	const CASES_PATH = "content.modules.flows.scenes.cases.sceneChange";

	return traverseAndUpdateObject(model, (data, path) => {
		const simplifiedPath = path.join(".").replace(/\d+\.?/g, "");

		return simplifiedPath === CASES_PATH
			? removeOnExit(data as ApplicationModel.Case["sceneChange"])
			: data;
	}) as NewApplicationModel;
}

function removeOnExit(
	caseSceneChange: ApplicationModel.Case["sceneChange"]
): NewApplicationModel.Case["sceneChange"] {
	return caseSceneChange?.onEnter
		? {
				onEnter: caseSceneChange.onEnter
			}
		: undefined;
}
