// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import type { EngineFrameProps } from "../../utils.js";
import { withActivityContext } from "../../utils.js";

import { NumberInput, StringInput } from "../inputs/index.js";
import { SimpleForm } from "../view.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const PersonForm = withActivityContext((props: Omit<EngineFrameProps, "type">) => {
	return (
		<SimpleForm {...props} title="Person">
			<Grid>
				<Row>
					<Column size={SIZE}>
						<StringInput label="First Name*" path="Person.PersonalData.FirstName" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Last Name*" path="Person.PersonalData.LastName" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Place of birth*" path="Person.PersonalData.PlaceOfBirth" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Nationality" path="Person.PersonalData.Nationality" />
					</Column>
					<Column size={SIZE}>
						<NumberInput label="Salary" path="Person.PersonalData.Salary" />
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});
