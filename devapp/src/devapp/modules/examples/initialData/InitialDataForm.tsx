// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";
import { HintTooltip } from "@com.mgmtp.a12.widgets/widgets-core/lib/tooltip/hint/main/hint.view.js";

import { SimpleForm, SimpleFormActions, StringInput } from "../../../mocks/SimpleForm/index.js";
import { withActivityContext } from "../../../mocks/utils.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const InitialDataForm = withActivityContext(props => {
	const activityId = props.activityId;
	const dispatch = useDispatch();
	const onCancel = useCallback(
		() => dispatch(SimpleFormActions.onCancel({ activityId })),
		[activityId, dispatch]
	);

	const footer = useMemo(
		() => ({
			leftButtons: [{ label: "Cancel", destructive: true, onClick: onCancel }]
		}),
		[onCancel]
	);

	return (
		<SimpleForm {...props} title="Initial Data Form" footer={footer}>
			<Grid>
				<Row>
					<Column size={SIZE}>
						<StringInput
							label="Field (Injection)"
							path="root.field1"
							addonAfter={
								<HintTooltip text="This field contains a value, that was provided by code." />
							}
						/>
					</Column>
					<Column size={SIZE}>
						<StringInput
							label="Field"
							path="root.field2"
							addonAfter={<HintTooltip text="This field does not contain any value as usual" />}
						/>
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});
