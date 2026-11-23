// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { withActivityContext } from "../../utils.js";

import { StringInput } from "../inputs/string-input.js";
import { SimpleForm } from "../view.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const OfferForm = withActivityContext(props => {
	return (
		<SimpleForm {...props} title="Offer">
			<Grid>
				<Row>
					<Column size={SIZE}>
						<StringInput label="Id" path="Offer.Id" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Title" path="Offer.Title" />
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});
