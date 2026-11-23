// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, ReactNode } from "react";
import { useSelector } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ModelSelectors } from "@com.mgmtp.a12.client/client-core";

import { EngineFrame } from "./utils.js";

export function ModelHeaderEngine(props: ViewNGProps): ReactNode {
	const model = useSelector(
		ModelSelectors.modelInScene({ activityId: props.activityId, modelType: "document" })
	);
	if (!model) {
		return null;
	}
	return (
		<EngineFrame {...props} type="Form" title="Model Header" padding>
			<pre>
				<code>{JSON.stringify(model.header, undefined, "  ")}</code>
			</pre>
		</EngineFrame>
	);
}

export function FormEngineViewMock(): JSX.Element {
	return <>Mocked Form Engine</>;
}

export function OverviewEngineViewMock(): JSX.Element {
	return <>Mocked Overview Engine</>;
}
