// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
