// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX } from "react";

import type { View } from "../../../core/view/index.js";

export function errorBoundaryProviderMock(): ComponentType<View.ProgressComponentProvider.PropsType> {
	return ErrorBoundaryMock;
}

export function ErrorBoundaryMock(props: View.ProgressComponentProvider.PropsType): JSX.Element {
	return <div data-type="ErrorBoundaryMock">{props.children}</div>;
}
