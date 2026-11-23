// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeEvery } from "typed-redux-saga";

import type { Model } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Activity } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ModelActions } from "@com.mgmtp.a12.client/client-core";

declare function customDocumentModelLoader(): Model;
declare function customFormModelLoader(): Model;
declare function modelsAreLoaded(): boolean;
declare function isActivityWithCustomModelLoading(activity: Activity): boolean;

// tag::saga[]
export function* loadModels(): SagaGenerator<void> {
	yield* takeEvery(
		[ActivityActions.push, ActivityActions.cancel],
		function* handlePushAction(action) {
			const activity = ActivityActions.push.match(action)
				? action.payload.activity
				: action.payload.replacementActivity;

			if (
				activity === undefined ||
				!isActivityWithCustomModelLoading(activity) ||
				modelsAreLoaded()
			) {
				return;
			}

			const documentModel = customDocumentModelLoader();
			const formModel = customFormModelLoader();

			yield* put(
				ModelActions.setModels({
					[formModel.header.id]: formModel,
					[documentModel.header.id]: documentModel
				})
			);
		}
	);
}
// end::saga[]
