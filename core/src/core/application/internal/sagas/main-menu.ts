// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { call, put, select } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import { ActivityActions } from "../../../activity/internal/actions.js";
import type { Activity } from "../../../activity/internal/activity.js";
import { ActivitySagas } from "../../../activity/internal/sagas.js";
import { ActivitySelectors } from "../../../activity/internal/selectors.js";

import { ApplicationActions } from "../actions.js";

import type { ApplicationSaga } from "./ApplicationSaga.js";
import { ActivityUtils } from "./utils.js";

const logger = LoggerFactory.getLogger("core/application");

function mainMenuItemClickSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle(_activityDescriptor: Activity.Descriptor, action: Action<{}>) {
			return ApplicationActions.startMainActivityRequested.match(action);
		},
		*handle({ payload }: Action<ApplicationActions.StartMainActivityRequestedPayload>) {
			try {
				const topLevelActivities = yield* select(ActivitySelectors.topLevelActivities());

				const pushActionToUse =
					payload.action ?? (yield* call(ActivityUtils.createInitialActivity, payload));

				if (Object.keys(topLevelActivities).length > 0) {
					yield* put(
						ActivityActions.cancelRequested({
							activityIds: Object.keys(topLevelActivities)
						})
					);

					const cancelled = yield* call(ActivitySagas.waitForResponseCancelRequested);
					if (cancelled) {
						yield* put(pushActionToUse);
					}
				} else {
					yield* put(pushActionToUse);
				}
			} catch (error) {
				logger.error(error);
			}
		}
	};
}

/** @internal */
export default {
	mainMenuItemClickSaga
};
