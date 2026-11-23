// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { createContext } from "react";

/** Provides props to modify the expanded state of the mobile main menu */
export const MainMenuContext = createContext<MainMenuContextProps | undefined>(undefined);

export interface MainMenuContextProps {
	readonly mainMenuExpanded: boolean;
	setMainMenuExpanded(expanded: boolean): void;
}
MainMenuContext.displayName = "MainMenuContext";
