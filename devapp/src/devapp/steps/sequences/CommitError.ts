// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

import { ActionAssertions } from "../ActionAssertion.js";
import type { ActionSequence } from "../ActionSequence.js";

export const commitError: ActionSequence = {
	name: "Commit Error",
	steps: [
		{
			description: "Open Commit Error View",
			type: "START_ACTIVITY",
			descriptor: {
				section: "ErrorHandling",
				feature: "CommitErrorHandling"
			}
		},
		{
			description: "Set empty data",
			type: "ADD_VALUES_TO_DOC",
			data: {},
			dirty: true // to be able to save/commit
		},
		{
			description: "Try Commit",
			type: "COMMIT_ACTION",
			shouldSucceed: false,
			test: state => {
				ActionAssertions.commitFailed(state);
			}
		},
		{
			description: "Try 2nd Commit",
			type: "COMMIT_ACTION",
			test: state => {
				const actual = ActivitySelectors.activities()(state);
				ActionAssertions.deepEqual({
					actual: actual,
					expected: {},
					message: "Expected activity map to be empty"
				});
			}
		}
	]
};
