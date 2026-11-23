// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "typescript-fsa";
import { isType } from "typescript-fsa";

import type { ActivityMap } from "../../../core/activity/index.js";

import { mockAction } from "./actionMocks.js";

export function mockReducer(state: ActivityMap = {}, action: AnyAction): ActivityMap {
	if (isType(action, mockAction)) {
		const activityId = action.payload.id;
		return {
			...state,
			[activityId]: {
				descriptor: { model: action.payload.model },
				dataHolders: [],
				id: activityId,
				activationTimestamp: 0
			}
		};
	}
	return state;
}
