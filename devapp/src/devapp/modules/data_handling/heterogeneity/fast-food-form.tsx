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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
