// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import deepEqual from "fast-deep-equal";
import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { ApplicationModel } from "../../../model/index.js";
import { ModelSelectors } from "../../../model/index.js";
import type { View } from "../../../view/internal/view.js";

import { DefaultErrorBoundaryProvider } from "../components/error-boundary/DefaultErrorBoundaryProvider.js";

import type { Layout, ProvidersProps } from "./LayoutProps.js";

interface StackRegionLayoutProps extends ProvidersProps {
	readonly regionReference: ApplicationModel.Region.Reference;
	readonly views: View[];
}

/**
 * RegionLayout that renders all views "on top" of each other, i.e. only the uppermost view is visible.
 */
function StackRegionLayout(props: StackRegionLayoutProps): JSX.Element | null {
	const {
		views,
		viewProvider,
		progressComponentProvider,
		errorBoundaryProvider = DefaultErrorBoundaryProvider,
		regionReference
	} = props;

	const subRegions = useSelector(ModelSelectors.subRegionRefs(regionReference), deepEqual);

	if (subRegions && subRegions.length > 0) {
		throw new Error("sub-regions are not supported");
	}

	if (views.length === 0) {
		return null;
	}

	const topView = views[views.length - 1];
	const ViewComponent = viewProvider(topView.name);

	const ProgressComponent = progressComponentProvider(regionReference, topView.name);
	const ErrorBoundary = errorBoundaryProvider(regionReference, topView.name);

	return (
		<ErrorBoundary
			activityId={topView.activityId}
			key={`${topView.name}-${topView.activityId}-${views.length}`}
			ariaLevel={1}
		>
			{ViewComponent.handleProgressIndicator ? (
				<ViewComponent {...topView} ariaLevel={1} ProgressComponent={ProgressComponent} />
			) : (
				<ProgressComponent activityId={topView.activityId}>
					<ViewComponent {...topView} ariaLevel={1} />
				</ProgressComponent>
			)}
		</ErrorBoundary>
	);
}

StackRegionLayout.whyDidYouRender = true;

const layout: Layout = {
	component: StackRegionLayout,
	visibleViews: "single"
};

/** @internal */
export default layout;
