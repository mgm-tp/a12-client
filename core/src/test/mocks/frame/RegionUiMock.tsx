// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
