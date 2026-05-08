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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
