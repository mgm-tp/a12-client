// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { createContext } from "react";

export interface PermissionContextProps {
	permissions: string[];
	setPermissions(permissions: string[]): void;
}

/**
 * A context that wraps the ApplicationFrameLayout in the devapp
 * to let users choose their own permissions. This is needed for
 * the menu permission example.
 */
export const PermissionContext = createContext<PermissionContextProps>({
	permissions: [],
	setPermissions: () => {}
});
