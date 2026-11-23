// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

import { applyDataHolderChange, ensureActivityError } from "../utils.js";

/** @internal */
export function handleError(
	state: ActivityMap,
	{ payload: { activityId, operationType, error } }: Action<ActivityActions.ErrorPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;
		const nextDataHolders = applyDataHolderChange(dataHolders, activity.descriptor, dataHolder => {
			const loadingState = operationType === "loading" ? "error" : dataHolder.loadingState;
			const savingState = operationType === "saving" ? "error" : dataHolder.savingState;
			const newActivityError = ensureActivityError(error);
			const oldActivityError = ensureActivityError(dataHolder.error);

			if (
				dataHolder.loadingState === loadingState &&
				dataHolder.savingState === savingState &&
				newActivityError === oldActivityError &&
				dataHolder.busy
			) {
				return dataHolder;
			}

			return {
				...dataHolder,
				error: newActivityError,
				loadingState,
				savingState,
				busy: false
			};
		});
		return dataHolders !== nextDataHolders
			? { ...activity, dataHolders: nextDataHolders }
			: activity;
	});
}
