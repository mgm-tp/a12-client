// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActionAssertions } from "../ActionAssertion.js";
import type { ActionSequence } from "../ActionSequence.js";

export const openModalRegion: ActionSequence = {
	name: "Open Modal Region",
	steps: [
		{
			description: "Open Modal Region View",
			type: "START_ACTIVITY",
			descriptor: {
				section: "UIHandling",
				feature: "ModalRegion"
			}
		},
		{
			description: "Open Modal Region",
			type: "START_ACTIVITY",
			descriptor: {
				section: "UIHandling",
				feature: "ModalRegion",
				modal: "true"
			},
			child: true,
			test: state => {
				ActionAssertions.openRegion({
					state,
					expectedRegion: ["MODAL"]
				});
			}
		},
		{
			description: "Close Modal Region",
			type: "CANCEL_REQUESTED_ACTION",
			vetoDialogExpected: false,
			test: state => {
				ActionAssertions.emptyRegion({
					state,
					emptyRegion: ["MODAL"]
				});
			}
		}
	]
};
