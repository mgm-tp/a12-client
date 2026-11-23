// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ActionCreator } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

export type { ActionCreator };

const actionCreator = actionCreatorFactory("Features");
export const initiateSimpleSaga = actionCreator<{ activityId: string }>("INIT_SIMPLE_SAGA");
