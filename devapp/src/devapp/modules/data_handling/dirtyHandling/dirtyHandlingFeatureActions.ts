// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const actionCreator = actionCreatorFactory("DIRTY_HANDLING");

export const initializeDataHolders =
	actionCreator<InitializeDataHolderPayload>("INITIALIZE_DATAHOLDER");

export interface InitializeDataHolderPayload extends ActivityActions.ActivityActionPayload {
	readonly instances: string[];
}

export const cancelActivities = actionCreator<CancelActivitiesPayload>("CANCEL_ACTIVITIES");

export interface CancelActivitiesPayload {
	readonly activityIds: string[];
}

export const setDirty = actionCreator<SetDirtyPayload>("SET_DIRTY");
export interface SetDirtyPayload {
	readonly activityId: string;
	readonly dirty: boolean;
}
