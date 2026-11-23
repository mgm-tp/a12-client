// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";

import type { View } from "../../../../view/index.js";

import { ErrorBoundary } from "./ErrorBoundary.js";

/** @internal */
export function DefaultErrorBoundaryProvider(): ComponentType<View.ErrorBoundaryProvider.PropsType> {
	return ErrorBoundary;
}
