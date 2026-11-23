// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::specific[]
import type { ComponentType, JSX } from "react";
import { Component } from "react";

import type { FrameViews, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { FrameFactories } from "@com.mgmtp.a12.client/client-core";

class SpecificErrorBoundary extends Component<View.ErrorBoundaryProvider.PropsType> {
	state = {
		error: null
	};

	componentDidCatch(error: Error): void {
		this.setState({ error });
	}

	render() {
		const { error } = this.state;
		if (error !== null) {
			return <div>Specific error text for ProductView</div>;
		}

		return this.props.children;
	}
}

function CustomErrorBoundaryProvider(
	regionReference: ApplicationModel.Region.Reference,
	viewName: string
): ComponentType<View.ErrorBoundaryProvider.PropsType> {
	const DefaultErrorBoundary = FrameFactories.errorBoundaryProvider();

	return viewName === "ProductView" ? SpecificErrorBoundary : DefaultErrorBoundary;
}
// end::specific[]

// tag::usage[]
export function MainComponent(): JSX.Element {
	const RegionUi = FrameFactories.regionUiProvider([]);

	// other props here...
	const regionUiProps = {} as FrameViews.RegionUiProps;

	return <RegionUi {...regionUiProps} errorBoundaryProvider={CustomErrorBoundaryProvider} />;
}
// end::usage[]
