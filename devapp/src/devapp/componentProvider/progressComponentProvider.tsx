// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import {
	ActivitySelectors,
	ClientWidgetMapContext,
	ViewViews
} from "@com.mgmtp.a12.client/client-core";
import type { ProgressIndicatorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.api.js";
import { ProgressIndicator } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.view.js";

const IndicatorStyles = { height: "100%", width: "100%" };

export function createProgressComponentProvider(delay?: number): View.ProgressComponentProvider {
	function ProgressComponent({
		activityId,
		children
	}: View.ProgressComponentProvider.PropsType): JSX.Element {
		const descriptor = useSelector(
			ActivitySelectors.activityPropById(activityId, a => a.descriptor)
		);
		const loading = useSelector(ActivitySelectors.busy(activityId));

		/** The focus behavior for the progress indicator is only done for this example */
		const focusHandlingProgressIndicatorExample =
			descriptor?.feature === "FocusHandlingProgressIndicator" &&
			descriptor?.section === "Examples";

		const parentRef = useRef<HTMLElement | null>(null);

		useEffect(() => {
			if (!focusHandlingProgressIndicatorExample) {
				return;
			}

			/**
			 * If the content is not loading anymore and there
			 * is a parentRef present: find the nearest content-box
			 * and focus it
			 */
			if (loading === false && parentRef.current !== null) {
				const parent = parentRef.current;

				findAndFocusContentBox(parent?.children);
				parentRef.current = null;
			}
		}, [loading, focusHandlingProgressIndicatorExample]);

		const DefaultWidgets = useContext(ClientWidgetMapContext);

		function CustomProgress(props: ProgressIndicatorProps): JSX.Element {
			/** Provide a custom progress indicator with 'focusOnOpen' set to true */
			return (
				<ProgressIndicator
					{...props}
					focusOnOpen
					id="progress-indicator"
					wrapperRef={elm => {
						parentRef.current = elm?.parentElement ?? null;
					}}
				/>
			);
		}

		const customWidgetMap = {
			...DefaultWidgets,
			ProgressIndicator: CustomProgress
		};

		return (
			<ClientWidgetMapContext.Provider value={customWidgetMap}>
				<ViewViews.ProgressIndicator
					style={IndicatorStyles}
					delay={delay}
					progress={loading ? "loading" : "none"}
				>
					{children}
				</ViewViews.ProgressIndicator>
			</ClientWidgetMapContext.Provider>
		);
	}

	return () => ProgressComponent;
}

/**
 * Search recursively for a content-box and focus it if it exists
 */
function findAndFocusContentBox(elements: HTMLCollection): boolean {
	if (!elements) {
		return false;
	}

	for (const element of Array.from(elements)) {
		if (element instanceof HTMLElement && element.classList.contains("contentbox")) {
			element.focus();
			return true;
		}

		if (element.children !== undefined) {
			if (findAndFocusContentBox(element.children)) {
				return true;
			}
		}
	}

	return false;
}
