// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX } from "react";

import type { ApplicationModel } from "../../../core/model/index.js";
import type { View } from "../../../core/view/index.js";

export function progressComponentProviderMock(
	regionReference: ApplicationModel.Region.Reference,
	viewName: string
): ComponentType<View.ProgressComponentProvider.PropsType> {
	return ProgressComponentMock;
}

export function ProgressComponentMock(
	props: View.ProgressComponentProvider.PropsType
): JSX.Element {
	return <div data-type="ProgressComponentMock">{props.children}</div>;
}
