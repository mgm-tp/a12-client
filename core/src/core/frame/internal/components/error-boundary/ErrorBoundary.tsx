// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ErrorInfo } from "react";
import { Component } from "react";

import type { View } from "../../../../view/index.js";

import { ErrorBoundaryFallbackComponent } from "./ErrorBoundaryFallbackComponent.js";

interface State {
	error: Error | null;
	info: ErrorInfo | null;
}

/** @internal */
export class ErrorBoundary extends Component<View.ErrorBoundaryProvider.PropsType, State> {
	state: State = {
		error: null,
		info: null
	};

	componentDidCatch(error: Error, info: ErrorInfo): void {
		this.setState({ error, info });
	}

	render() {
		const {
			activityId,
			children,
			FallbackComponent = ErrorBoundaryFallbackComponent,
			ariaLevel
		} = this.props;
		const { error, info } = this.state;

		if (error !== null) {
			return (
				<FallbackComponent
					activityId={activityId}
					componentStack={info?.componentStack ?? ""}
					error={error}
					ariaLevel={ariaLevel}
				/>
			);
		}

		return children;
	}
}
