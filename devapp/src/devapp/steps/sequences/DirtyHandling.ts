// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

import type { Action } from "../Action.js";
import { ActionAssertions } from "../ActionAssertion.js";
import type { ActionSequence } from "../ActionSequence.js";
import { Extractors } from "../dataFromModelSelectors.js";

export const dirtyHandling: ActionSequence = {
	name: "Dirty Handling",
	steps: [
		{
			description: "Open Heterogeneity",
			type: "START_ACTIVITY",
			descriptor: {
				section: "DataHandling",
				feature: "heterogeneity",
				model: "Supertype_Food-document"
			}
		},
		{
			description: "Open document",
			type: "OPEN_DOCUMENT",
			parentModelName: "Supertype_Food-document",
			documentModelName: "SubType_Fruits-document",
			documentIndex: 0,
			test: state => {
				ActionAssertions.openDocument({
					state
				});

				ActionAssertions.documentWithPartialData({
					state,
					expectedResult: "SubType_Fruits-document/1",
					dataEntrySelector: Extractors.extractId
				});

				ActionAssertions.documentWithPartialData({
					state,
					expectedResult: "Fruit1",
					dataEntrySelector: Extractors.extractFieldValue("Name", "root")
				});
			}
		},
		{
			description: "Trigger dirty",
			type: "SET_DIRTY",
			dirty: true
		},
		{
			description: "Cancel",
			type: "CANCEL_REQUESTED_ACTION",
			vetoDialogExpected: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "Veto",
			type: "RESPONSE_CANCEL_CONFIRMATION_REQUIRED",
			veto: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "Cancel again",
			type: "CANCEL_REQUESTED_ACTION",
			vetoDialogExpected: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "No Veto",
			type: "RESPONSE_CANCEL_CONFIRMATION_REQUIRED",
			veto: false,
			test: assertNumberOfActivities(1)
		}
	]
};

function assertNumberOfActivities(expected: number): Action.Base["test"] {
	return state => {
		const actualNumberOfActivities = Object.keys(ActivitySelectors.activities()(state)).length;
		ActionAssertions.deepEqual({
			actual: actualNumberOfActivities,
			expected,
			message: "Wrong number of activities"
		});
	};
}
