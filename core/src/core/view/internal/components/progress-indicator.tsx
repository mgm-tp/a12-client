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

import type { ComponentType, CSSProperties, JSX, ReactNode } from "react";
import { useContext } from "react";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { ProgressIndicatorProps as WidgetProgressIndicatorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.api.js";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";

/** @internal */
export default function BaseProgressIndicator(props: {
	readonly labelKey?: string;
	readonly progress: "none" | "loading" | "error";
	readonly style?: CSSProperties;
	readonly children?: ReactNode;
	readonly disableFastAppear?: boolean;
	readonly delay?: number;
	readonly global?: boolean;
	/**
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 * */
	readonly ProgressIndicatorComponent?: ComponentType<WidgetProgressIndicatorProps>;
}): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;

	const { ProgressIndicator } = useContext(ClientWidgetMapContext);

	const labelKey = props.labelKey;

	// TODO: Remove with A12-17777
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	const ProgressIndicatorComponent = props.ProgressIndicatorComponent ?? ProgressIndicator;

	return (
		<div style={props.style}>
			{props.children}
			{props.progress !== "none" ? (
				<ProgressIndicatorComponent
					label={labelKey ? localizer({ key: labelKey }) : undefined}
					hideLoadingCircle={props.progress === "error"}
					fastAppear={!props.disableFastAppear}
					openingDelay={props.delay}
					global={props.global ?? false}
				/>
			) : undefined}
		</div>
	);
}

BaseProgressIndicator.whyDidYouRender = true;
