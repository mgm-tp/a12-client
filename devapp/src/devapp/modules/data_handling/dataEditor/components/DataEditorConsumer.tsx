// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { SimpleForm, StringInput } from "../../../../mocks/SimpleForm/index.js";
import { withActivityContext } from "../../../../mocks/utils.js";
import { isRecord } from "../../../../utils/types.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const DataEditorConsumer = withActivityContext(
	props => {
		return (
			<SimpleForm {...props} title="Book">
				<Grid>
					<Row>
						<Column size={SIZE}>
							<StringInput label="Title" path="BookDetails.title" />
						</Column>
						<Column size={SIZE}>
							<StringInput label="Publication year" path="BookDetails.publicationYear" />
						</Column>
					</Row>
				</Grid>
			</SimpleForm>
		);
	},
	data => isRecord(data) && "document" in data
);
