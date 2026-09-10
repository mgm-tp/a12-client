/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import { fireEvent } from "@testing-library/react";
import type { Store } from "redux";

import type { Localizer } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { defaultLocalizerFactory } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { DataRoles } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/data-roles.js";

import { ActivityActions } from "../../../../../core/activity/index.js";
import { DIRTY_HANDLING_RESOURCE_KEYS } from "../../../../../extensions/dirtyHandling/index.js";
import { DefaultVetoDialog } from "../../../../../extensions/dirtyHandling/internal/components/VetoDialog.js";
import { createStoreForTest } from "../../../../unit/core/frame/utils.js";
import { createActivity } from "../../../../utils/activity.js";
import { US_LOCALE, US_LOCALIZER_CTX } from "../../../../utils/localization.js";
import { render, within, type RenderResult } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

describe("extensions.dirtyHandling.components", () => {
	describe("VetoDialog", () => {
		describe("given a store", () => {
			describe("with activities with all activities having cancelConfirmationRequired=false", () => {
				it("shows no VetoDialog", () => {
					const activity = createActivity({
						id: "A",
						cancelConfirmationRequired: false
					});

					const result = renderVetoDialog(
						createStoreForTest({ initialState: { activities: { A: activity } } })
					);

					const vetoDialog = result.queryAllByDataRole(DataRoles.Modal);
					strictEqual(vetoDialog.length, 0, "Expected to find no ModalOverlay");
				});
			});

			describe("with an activity with cancelConfirmationRequired=true", () => {
				const localizer: Localizer = localizable => localizable.key;

				function testModal(expectedVeto: boolean, label?: string): void {
					const activity = createActivity({
						id: "A",
						cancelConfirmationRequired: true
					});
					const store = createStoreForTest({ initialState: { activities: { A: activity } } });
					const result = renderVetoDialog(store, localizer);

					const vetoDialog = result.getByRole("dialog");

					if (label) {
						const button = within(vetoDialog).getByRole("button", {
							name: label
						});
						fireEvent.click(button);
					} else {
						fireEvent.keyDown(vetoDialog, { key: "Escape", code: "Escape" });
					}

					const cancelConfirmationAction = store
						.getActions()
						.find(ActivityActions.responseCancelConfirmation.match);
					deepStrictEqual(cancelConfirmationAction, {
						payload: {
							activityId: activity.id,
							veto: expectedVeto
						},
						type: "Activity/RESPONSE_CANCEL_CONFIRMATION"
					});
				}

				it("renders a ModalOverlay, with a button which discards the changes", () => {
					testModal(false, DIRTY_HANDLING_RESOURCE_KEYS.veto.buttonDiscard);
				});

				it("renders a ModalOverlay, with a button which aborts the cancellation", () => {
					testModal(true, DIRTY_HANDLING_RESOURCE_KEYS.veto.buttonAbort);
				});

				it("renders a ModalOverlay, which aborts the cancellation when escape is pressed", () => {
					testModal(true);
				});
			});
		});
	});
});

function renderVetoDialog(store: Store<object>, testLocalizer?: Localizer): RenderResult {
	const locale = US_LOCALE;
	const localizerContext = {
		...US_LOCALIZER_CTX,
		localizer: testLocalizer ?? defaultLocalizerFactory({ locale })
	};

	const result = render(
		<TestWrapper store={store} localizerContextValue={localizerContext}>
			<DefaultVetoDialog />
		</TestWrapper>
	);
	return result;
}
