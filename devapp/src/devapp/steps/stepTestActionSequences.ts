// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ActionSequence } from "./ActionSequence.js";
import { commitError } from "./sequences/CommitError.js";
import { dirtyHandling } from "./sequences/DirtyHandling.js";
import { openModalRegion } from "./sequences/OpenModalRegion.js";
import { openNewMultiDashboardOffer } from "./sequences/OpenNewMultiDashboardOffer.js";

export const stepTestActionSequences: ReadonlyArray<ActionSequence> = [
	commitError,
	openModalRegion,
	dirtyHandling,
	openNewMultiDashboardOffer
];
