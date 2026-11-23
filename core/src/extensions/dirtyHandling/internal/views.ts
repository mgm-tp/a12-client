// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";

import type { VetoDialogProps } from "./components/VetoDialog.js";
import { DefaultVetoDialog } from "./components/VetoDialog.js";

/**
 * Provides a view for handling user-interaction with regards to dirty handling
 */
export namespace DirtyHandlingViews {
	/**
	 * A React component that provides a modal dialog for activity veto handling.
	 */
	export const VetoDialog: ComponentType<VetoDialogProps> = DefaultVetoDialog;
}
