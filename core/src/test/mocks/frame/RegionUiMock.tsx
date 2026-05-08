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

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { FrameViews } from "../../../core/frame/index.js";
import type { RegionUiProps } from "../../../core/frame/internal/layout/LayoutProps.js";
import type { ApplicationModel } from "../../../core/model/index.js";
import { ViewSelectors } from "../../../core/view/internal/selectors.js";

export interface RegionUiMockProps extends FrameViews.ProviderProps {
	regionReference: ApplicationModel.Region.Reference;
	showLayoutAnimation?: boolean;
}

export function RegionUiMock(props: RegionUiMockProps): JSX.Element {
	const { layout, views } = useSelector(ViewSelectors.region(props.regionReference));

	const ClientLayout = props.layoutProvider(layout.name);

	return (
		<div data-type="RegionUiMock" data-name={props.regionReference.at(-1)}>
			<ClientLayout.component
				key={`${props.regionReference}-${layout}`}
				{...props}
				views={views}
				regionReference={props.regionReference}
				layoutProvider={props.layoutProvider}
				regionUiProvider={props.regionUiProvider}
				viewProvider={props.viewProvider}
			/>
		</div>
	);
}

export function regionUiProviderMock(): React.ComponentType<RegionUiProps> {
	return RegionUiMock;
}
