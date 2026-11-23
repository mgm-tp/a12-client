// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, select } from "typed-redux-saga";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import { StoreSagas } from "../../store/index.js";

import { Model } from "./Model.js";
import { ModelSelectors } from "./selectors.js";

export namespace ModelSagas {
	export function* waitForModelsLoaded(activityId: string): SagaGenerator<ModelAPI[]> {
		const modelDescriptors = yield* select(ModelSelectors.modelDescriptorsByActivityId(activityId));
		if (modelDescriptors.length === 0) {
			return [];
		}

		const models = yield* call(() =>
			StoreSagas.waitForStateChange(ModelSelectors.modelsLoaded(modelDescriptors))
		);
		if (models === undefined || Model.Error.isInstance(models)) {
			const errMessage = models?.message ?? "Cannot load necessary models.";

			throw new Error(errMessage);
		}

		return models;
	}
}
