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

import deepEqual from "fast-deep-equal";
import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { ApplicationModel } from "../../../model/index.js";
import { ModelSelectors } from "../../../model/index.js";
import type { View } from "../../../view/index.js";

import { DefaultErrorBoundaryProvider } from "../components/error-boundary/DefaultErrorBoundaryProvider.js";

import type { Layout, ProvidersProps } from "./LayoutProps.js";

interface NullRegionLayoutProps extends ProvidersProps {
	readonly regionReference: ApplicationModel.Region.Reference;
	readonly views: View[];
}

function NullRegionLayout(props: NullRegionLayoutProps): JSX.Element | null {
	const subRegions = useSelector(ModelSelectors.subRegionRefs(props.regionReference), deepEqual);

	if (subRegions && subRegions.length > 0) {
		const subRegionComponents = subRegions.map(r => ({
			region: r,
			component: props.regionUiProvider(r)
		}));
		return (
			<>
				{subRegionComponents.map(SubRegion => (
					<SubRegion.component
						{...props}
						key={SubRegion.region.join("/")}
						regionReference={SubRegion.region}
						layoutProvider={props.layoutProvider}
						regionUiProvider={props.regionUiProvider}
						viewProvider={props.viewProvider}
					/>
				))}
			</>
		);
	} else {
		const {
			views,
			viewProvider,
			progressComponentProvider,
			errorBoundaryProvider = DefaultErrorBoundaryProvider,
			regionReference
		} = props;

		if (views.length === 0) {
			return null;
		}
		const viewsComponents = views.map(view => ({
			view,
			ViewComponent: viewProvider(view.name),
			ProgressComponent: progressComponentProvider(regionReference, view.name),
			ErrorBoundary: errorBoundaryProvider(regionReference, view.name)
		}));
		return (
			<>
				{viewsComponents.map(({ view, ViewComponent, ProgressComponent, ErrorBoundary }, i) => (
					<ErrorBoundary activityId={view.activityId} key={`${view.name}-${view.activityId}-${i}`}>
						{ViewComponent.handleProgressIndicator ? (
							<ViewComponent {...view} ProgressComponent={ProgressComponent} />
						) : (
							<ProgressComponent activityId={view.activityId}>
								<ViewComponent {...view} />
							</ProgressComponent>
						)}
					</ErrorBoundary>
				))}
			</>
		);
	}
}

NullRegionLayout.whyDidYouRender = true;

const layout: Layout = {
	component: NullRegionLayout,
	visibleViews: "multiple"
};

/** @internal */
export default layout;
