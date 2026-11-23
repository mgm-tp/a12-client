// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
		// oxlint-disable-next-line react/exhaustive-deps
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
