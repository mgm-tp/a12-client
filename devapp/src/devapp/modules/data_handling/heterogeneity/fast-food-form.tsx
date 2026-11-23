// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { NumberInput, SimpleForm, StringInput } from "../../../mocks/SimpleForm/index.js";
import { withActivityContext } from "../../../mocks/utils.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

export const FastFoodForm = withActivityContext(props => {
	return (
		<SimpleForm {...props} title="FastFood Form">
			<Grid>
				<Row>
					<Column size={SIZE}>
						<StringInput label="Name of food" path="root.Name" />
					</Column>
					<Column size={SIZE}>
						<NumberInput label="Calories [kCal]" path="root.Food.Food.NutritionInfo.Calories" />
					</Column>
					<Column size={SIZE}>
						<NumberInput label="Protein [g]" path="root.Food.Food.NutritionInfo.Proteins" />
					</Column>
					<Column size={SIZE}>
						<NumberInput
							label="Carbohydrates [g]"
							path="root.Food.Food.NutritionInfo.Carbohydrates"
						/>
					</Column>
					<Column size={SIZE}>
						<NumberInput label="Fat [g]" path="root.Food.Food.NutritionInfo.Fat" />
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});
