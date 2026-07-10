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

import type { ComponentType, JSX } from "react";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { FrameFactories } from "@com.mgmtp.a12.client/client-core";

const DefaultErrorBoundary = FrameFactories.errorBoundaryProvider();

/**
 * Wraps a view component with the default error boundary from the Client.
 *
 * Use this for views in DynamicConfiguration that need to display an error
 * fallback instead of crashing when a rendering error occurs. The default
 * error boundary and its fallback component are fully customizable via the
 * Client application setup.
 */
export function withErrorBoundary(
	Component: ComponentType<ViewNGProps>
): ComponentType<ViewNGProps> {
	function WithErrorBoundary(props: ViewNGProps): JSX.Element {
		return (
			<DefaultErrorBoundary activityId={props.activityId} ariaLevel={props.ariaLevel}>
				<Component {...props} />
			</DefaultErrorBoundary>
		);
	}

	WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

	return WithErrorBoundary;
}
