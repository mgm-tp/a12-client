// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const factory = actionCreatorFactory("SimpleForm");

export const onSave = factory<SavePayload>("onSave");
export type SavePayload = ActivityActions.ActivityActionPayload;

export const onCancel = factory<CancelPayload>("onCancel");
export type CancelPayload = ActivityActions.ActivityActionPayload;

export const onValueChanged = factory<ValueChangedPayload>("onValueChanged");
export interface ValueChangedPayload extends ActivityActions.ActivityActionPayload {
	readonly path: string;
	readonly value: unknown;
}

export const onEventTriggered = factory<EventButtonTriggeredPayload>("onEventTriggered");
export interface EventButtonTriggeredPayload extends ActivityActions.ActivityActionPayload {
	readonly eventName: string;
}
