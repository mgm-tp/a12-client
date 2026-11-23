// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

const actionFactory = actionCreatorFactory("Mock-Actions");
export const dummyAction = actionFactory<string>("DUMMY");
export const anotherDummyAction = actionFactory<string>("ANOTHER_DUMMY");

const actionFactory2 = actionCreatorFactory("MockAction");
export const mockAction = actionFactory2<{ id: string; model: string }>("MOCK_ACTION");
