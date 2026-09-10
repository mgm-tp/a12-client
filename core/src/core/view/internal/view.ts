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

import type { ComponentType, ReactNode } from "react";

import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import type { Model } from "../../model/internal/Model.js";

/**
 * Representation of the view to be rendered as determined by the scene and its directives in the Application Model.
 */
export interface View {
	/** Name of the view component */
	readonly name: string;

	/** Directive that created this view */
	readonly modelDescriptors?: Model.Descriptor[];

	/** The id of the underlying activity to which the view is connected */
	readonly activityId: string;

	/** Contains configuration for the view that came from the Application Model */
	readonly configuration?: object;

	/** Contains configurable constraints for the layout that came from the Application Model */
	readonly constraints?: object;

	/**
	 * Level of the view component in the aria hierarchy.
	 * Should be set to the aria-level of the title component of the view.
	 */
	readonly ariaLevel?: number;

	/**
	 * An optional ProgressIndicator component to let the view component conditionally render it
	 */
	readonly ProgressComponent?: ComponentType<View.ProgressComponentProvider.PropsType>;
}

export namespace View {
	/**
	 * A react component that will accept {@link View} as props and optionally
	 * has an additional boolean, which denotes whether the component
	 * wants to handle progress indication itself.
	 */
	export type ViewComponent = ComponentType<View> & { handleProgressIndicator?: boolean };

	/**
	 * This view provider will provide to a given component name a react component
	 * that will accept {@link View} as props.
	 *
	 * If the view component wants to handle progress indication itself, the component has
	 * to set the flag `handleProgressIndicator`.
	 */
	export type Provider = (componentName: string) => ViewComponent;

	/**
	 * This progress component provider will provide to a given region reference and a view name a react component
	 * that will accept {@link ProgressComponentProvider.PropsType} as props.
	 */
	export type ProgressComponentProvider = (
		regionReference: ApplicationModel.Region.Reference,
		viewName: string
	) => ComponentType<ProgressComponentProvider.PropsType>;

	export namespace ProgressComponentProvider {
		export interface PropsType {
			/** The id of the underlying activity to which the progress indicator is related */
			readonly activityId: string;

			/** Child nodes the progress shall be indicated for */
			readonly children?: ReactNode;
		}
	}

	/**
	 * This error boundary provider will provide a error boundary react component
	 * for a given region reference and view name. More information about error
	 * boundaries can be found here: https://reactjs.org/docs/error-boundaries.html
	 */
	export type ErrorBoundaryProvider = (
		regionReference: ApplicationModel.Region.Reference,
		viewName: string
	) => ComponentType<ErrorBoundaryProvider.PropsType>;

	export namespace ErrorBoundaryProvider {
		export interface FallbackComponentProps {
			activityId: string;
			error: Error;
			componentStack: string;

			/**
			 * The aria level for the title of the fallback component.
			 */
			readonly ariaLevel?: number;
		}
		export interface PropsType {
			/**
			 *  The id of the underlying activity to which the error boundary is related.
			 *  Used to be able to provide a cancel activity button for the
			 *  error boundary fallback component.
			 */
			readonly activityId: string;

			/** Child nodes the error boundary wraps and catches error for */
			readonly children?: ReactNode;

			/**
			 *  Optional fallback component which is displayed when the error boundary
			 *  catches an error. If no fallback component is specified, the default
			 *  error fallback component of the Client is used.
			 */
			readonly FallbackComponent?: ComponentType<FallbackComponentProps>;

			/**
			 * The aria level given to the fallback component.
			 */
			readonly ariaLevel?: number;
		}
	}
}
