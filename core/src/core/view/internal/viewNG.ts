// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";

/**
 * @experimental
 */
export type ViewNGComponent = ComponentType<ViewNGProps>;

/**
 * @experimental
 */
export interface ViewNGProps {
	/** The id of the underlying activity to which the view is connected */
	readonly activityId: string;

	/**
	 * Level of the view component in the aria hierarchy.
	 * Should be set to the aria-level of the title component of the view.
	 */
	readonly ariaLevel?: number;
}

/**
 * @experimental
 */
export interface ViewNG {
	/** Contains configurable constraints for the layout */
	readonly constraints?: object;

	/** the view component to render */
	readonly Component: ViewNGComponent;

	/** props for the view component */
	readonly props: ViewNGProps;
}
