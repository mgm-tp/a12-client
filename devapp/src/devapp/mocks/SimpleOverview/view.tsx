// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";
import type { RowStyles } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/table.api.js";
import { Table } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/table.view.js";

import type { EngineFrameProps } from "../utils.js";
import { EngineFrame, useActivityId, withActivityContext } from "../utils.js";

import { SimpleOverviewActions } from "./actions.js";
import { DocumentListData } from "./data.js";
import { useDocumentListData } from "./hooks.js";

export interface SimpleOverviewProps extends Omit<EngineFrameProps, "type"> {
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly columns: BaseColumnType<any>[];
	readonly title?: string;
}

type RowType = TableDocument;

export const SimpleOverview = withActivityContext((props: SimpleOverviewProps) => {
	const [selectedRow, setSelectedRow] = useState<RowType | undefined>();
	const data = useDocumentListData();

	const activityId = useActivityId();
	const rowStyling = useCallback(
		(params: { row: RowType }): RowStyles => {
			return { selected: selectedRow === params.row };
		},
		[selectedRow]
	);

	const dispatch = useDispatch();
	const rowEventHandlers = useCallback(
		(params: { row: RowType }) => ({
			onClick: (): void => {
				setSelectedRow(selectedRow => (selectedRow === params.row ? undefined : params.row));
				dispatch(
					SimpleOverviewActions.onSelectDocument({
						activityId,
						documentId: params.row.id,
						model: params.row.id.split("/")[0]
					})
				);
			}
		}),
		[activityId, dispatch]
	);

	const onCreateDocument = useCallback(() => {
		dispatch(SimpleOverviewActions.onCreateDocument({ activityId }));
	}, [activityId, dispatch]);

	return (
		<EngineFrame
			{...props}
			type="Overview"
			padding={false}
			headingButtons={
				props.headingButtons !== undefined ? (
					props.headingButtons
				) : (
					<ContentBoxElements.HeadingActionButton
						icon={<Icon>add</Icon>}
						invert
						onClick={onCreateDocument}
					/>
				)
			}
		>
			<Table
				data={data.documents}
				columns={props.columns}
				rowStyling={rowStyling}
				rowEventHandlers={rowEventHandlers}
			/>
		</EngineFrame>
	);
}, DocumentListData.isInstance);

export interface TableDocument {
	id: string;
}
