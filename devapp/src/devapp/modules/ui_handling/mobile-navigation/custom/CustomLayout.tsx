// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useMemo } from "react";

import type { LayoutPropsNG, ViewNG } from "@com.mgmtp.a12.client/client-core";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

export function CustomLayout(props: LayoutPropsNG): JSX.Element {
	const visibleViews = props.views.slice(-2);

	return (
		<LayoutGrid.Grid className={addPrefix("layoutGrid--fullSize")}>
			<LayoutGrid.Row>
				{visibleViews.length === 1 ? (
					<Column {...visibleViews[0]} lgSize={12} />
				) : (
					<>
						<Column {...visibleViews[0]} lgSize={4} />
						<Column {...visibleViews[1]} lgSize={8} />
					</>
				)}
			</LayoutGrid.Row>
		</LayoutGrid.Grid>
	);
}

interface ColumnProps extends ViewNG {
	readonly lgSize: LayoutGridProps.ColumnNumber;
}

function Column({ lgSize, Component, props }: ColumnProps): JSX.Element {
	const size = useMemo(() => ({ sm: 12, md: 4, lg: lgSize }) as const, [lgSize]);

	return (
		<LayoutGrid.Column size={size}>
			<Component {...props} />
		</LayoutGrid.Column>
	);
}
