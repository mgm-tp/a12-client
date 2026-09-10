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

import type { JSX, ReactNode } from "react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { ActivityActions, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";
import type { TableRenderPropsType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/table-renderer.api.js";
import { Table } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/table.view.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

import { useSingleDocumentValue } from "../../../../mocks/SimpleForm/hooks.js";
import { SimpleForm, StringInput } from "../../../../mocks/SimpleForm/index.js";
import type { BaseInput } from "../../../../mocks/SimpleForm/inputs/base-input.js";
import { useActivityId, withActivityContext } from "../../../../mocks/utils.js";

import type { BookDetails } from "../data/Book.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const DataEditorSource = withActivityContext(props => {
	return (
		<SimpleForm {...props} title={"Book Author"}>
			<Grid>
				<Row>
					<Column size={SIZE}>
						<StringInput label="Name*" path="Author.name" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Surname*" path="Author.surname" />
					</Column>
					<Column size={SIZE}>
						<Typography.Headline level={3} ariaLevel={3} divider>
							Books
						</Typography.Headline>
						<Typography.Body>
							<Repeat path="Author.Books" />
						</Typography.Body>
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});

function Repeat(props: BaseInput.Props): JSX.Element {
	const [value] = useSingleDocumentValue<{ BookDetails: BookDetails }[] | undefined>(props.path);
	const data = (value ?? []).map(({ BookDetails }) => BookDetails);

	const activityId = useActivityId();
	const dispatch = useDispatch();
	const onOpenBook = useCallback(
		(row: BookDetails) => {
			dispatch(
				ActivityActions.create({
					activityDescriptor: { model: "Book", instance: row.id },
					initiatingActivityId: activityId
				})
			);
		},
		[activityId, dispatch]
	);
	const onAddBook = useCallback(() => {
		dispatch(
			ActivityActions.create({
				activityDescriptor: { model: "Book", instance: NEW_INSTANCE_IDENTIFIER },
				initiatingActivityId: activityId,
				loadingState: "missing"
			})
		);
	}, [activityId, dispatch]);

	const bodyContentRenderer = useCallback(
		(params: TableRenderPropsType.BodyContentProps<BookDetails>): ReactNode => {
			const { column, row, rowIndex } = params;
			if (!column.actionColumn) {
				return column.dataGetter?.({ row, rowIndex });
			}

			return (
				<Button
					label="Open"
					onClick={(event): void => {
						event.stopPropagation();
						onOpenBook(row);
					}}
				/>
			);
		},
		// Need to listen to data changes, otherwise the table will not be updated
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[onOpenBook, data]
	);

	return (
		<>
			<Table<BookDetails>
				data={data}
				columns={BookColumns}
				componentRenderers={{ bodyContentRenderer, footRenderer: () => null }}
			/>
			<Button label="Add book" onClick={onAddBook} />
		</>
	);
}

const BookColumns: BaseColumnType<BookDetails>[] = [
	{ label: "Title", dataGetter: ({ row }) => row.title },
	{ label: "", pinning: "right", actionColumn: true }
];
