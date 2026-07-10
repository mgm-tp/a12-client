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

// tag::specific[]
import type { ComponentType, JSX } from "react";
import { Component } from "react";

import type { ApplicationModel, FrameViews, View } from "@com.mgmtp.a12.client/client-core";
import { FrameFactories } from "@com.mgmtp.a12.client/client-core";

class SpecificErrorBoundary extends Component<View.ErrorBoundaryProvider.PropsType> {
	state: { error: Error | null } = {
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
