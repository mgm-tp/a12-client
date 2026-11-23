// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
	// oxlint-disable-next-line typescript/no-deprecated
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
