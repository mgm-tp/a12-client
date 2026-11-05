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

import type { ComponentType } from "react";

/**
 * @experimental
 *
 * A view contributed through `DynamicConfiguration`.
 *
 * `P` declares the component's own props on top of the core-injected
 * {@link ViewNGProps}, so the shape is written once and used both for the
 * component and for the `componentProps` that feed it:
 *
 * ```tsx
 * interface GreetingProps { readonly greeting?: string }
 * const Greeting: ViewNGComponent<GreetingProps> = props => <span>{props.greeting}</span>;
 * ```
 */
export type ViewNGComponent<P = unknown> = ComponentType<ViewNGProps & P>;

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
 *
 * The extra props a view is given through `componentProps`.
 *
 * Any plain data is allowed. The props the core sets itself
 * ({@link ViewNGProps}) are not: the core always wins, so passing one here
 * would do nothing. They are rejected instead of being ignored quietly.
 */
export type ContributedViewProps = Record<string, unknown> &
	Partial<Record<keyof ViewNGProps, never>>;

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
