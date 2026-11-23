// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { SimpleForm, SimpleFormActions, StringInput } from "../../../mocks/SimpleForm/index.js";
import { useDefaultDataHolder, withActivityContext } from "../../../mocks/utils.js";

import { selectNextDocumentId } from "./sagas.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;
const SIZE_LG = { sm: 12, md: 12, lg: 12 } as LayoutGridProps.ColumnSize;

export const ActivityReplacementForm = withActivityContext(props => {
	const activityId = props.activityId;
	const dispatch = useDispatch();

	const onBackButtonClicked = useCallback(() => {
		dispatch(SimpleFormActions.onEventTriggered({ activityId, eventName: "back" }));
	}, [activityId, dispatch]);
	const onForwardButtonClicked = useCallback(() => {
		dispatch(SimpleFormActions.onEventTriggered({ activityId, eventName: "forward" }));
	}, [activityId, dispatch]);

	const onSave = useCallback(
		() => dispatch(SimpleFormActions.onSave({ activityId })),
		[activityId, dispatch]
	);
	const onCancel = useCallback(
		() => dispatch(SimpleFormActions.onCancel({ activityId })),
		[activityId, dispatch]
	);

	const { dirty } = useDefaultDataHolder();
	const noPreviousDocument = !useSelector(selectNextDocumentId(activityId, "back"));
	const noNextDocument = !useSelector(selectNextDocumentId(activityId, "forward"));

	return (
		<SimpleForm
			{...props}
			title="ActivityReplacement Form"
			footer={{
				leftButtons: [
					{ label: "Cancel", destructive: true, onClick: onCancel },
					{ label: "Save", disabled: !dirty, primary: true, onClick: onSave }
				],
				rightButtons: [
					{
						label: "Back",
						disabled: dirty || noPreviousDocument,
						onClick: onBackButtonClicked
					},
					{
						label: "Forward",
						primary: true,
						disabled: !dirty || noNextDocument,
						onClick: onForwardButtonClicked
					}
				]
			}}
		>
			<Grid>
				<Row>
					<Column size={SIZE}>
						<p>
							<b>Description</b>
							<br />
							This example is used to show how the replace activity feature can be utilized.
						</p>
						<ul>
							<li>
								By clicking the <b>back</b> button a cancel action is triggered that will replace
								the current activity with a new activity that will contain the previous document of
								the overview.
							</li>
							<li>
								By clicking the <b>forward</b> button, which is only possible when the document is
								dirty, a commit action is triggered that will replace the current activity with a
								new activity that will contain the next document of the overview.
							</li>
						</ul>
					</Column>
					<Column size={SIZE_LG}>
						<StringInput label="Dummy Field" path="root.DummyField" />
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});
