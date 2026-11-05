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

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import {
	ContentBoxElements,
	Icon,
	type BaseColumnType,
	type RowStyles,
	Table
} from "@com.mgmtp.a12.widgets/widgets-core";

import type { EngineFrameProps } from "../utils.js";
import { EngineFrame, useActivityId, withActivityContext } from "../utils.js";

import { isDocumentListData } from "./data.js";
import { useDocumentListData } from "./hooks.js";

import { SimpleOverviewActions } from "./index.js";

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
}, isDocumentListData);

export interface TableDocument {
	id: string;
}
