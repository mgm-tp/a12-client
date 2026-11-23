// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Lens } from "monocle-ts";
import type { Action, AnyAction } from "typescript-fsa";

import { ActivityActions, StoreFactories } from "@com.mgmtp.a12.client/client-core";

import { isExampleDescriptor } from "./descriptor.js";

/**
 * Whenever a deep link is applied, the `loadingState` for the new activity is determined from the matching scene.
 * Since we're using a dynamic scene without models, this will be "without" (but we want "missing")
 *
 * To ensure that data loading starts correctly, we therefore need to manually set the `loadingState`
 */
export const setLoadingStateMiddleware = StoreFactories.createMiddleware((_, next, action) =>
	next(isExamplePushAction(action) ? loadingStateLens.modify(() => "missing")(action) : action)
);

const loadingStateLens = Lens.fromPath<Action<ActivityActions.PushPayload>>()([
	"payload",
	"activity",
	"dataHolders",
	0,
	"loadingState"
]);

function isExamplePushAction(action: AnyAction): action is Action<ActivityActions.PushPayload> {
	return (
		ActivityActions.push.match(action) && isExampleDescriptor(action.payload.activity.descriptor)
	);
}
