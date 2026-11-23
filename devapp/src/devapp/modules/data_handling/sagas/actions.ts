// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const actionCreator = actionCreatorFactory("DATA_SAGAS_EXAMPLE");

interface CommonPayload extends ActivityActions.ActivityActionPayload {
	readonly dataholderIds: string[];
}

export const toggleUpdateInstance =
	actionCreator<ActivityActions.ActivityActionPayload>("TOGGLE_INSTANCE_UPDATE");
export const addDataHolder = actionCreator<ActivityActions.ActivityActionPayload>("ADD_DH");
export const logActionType = actionCreator<
	ActivityActions.ActivityActionPayload & { readonly type: string }
>("LOG");
export const toggleDirty = actionCreator<CommonPayload>("TOGGLE_DIRTY");
export const dataDeleted = actionCreator<CommonPayload>("DELETED");
