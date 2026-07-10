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

import { createContext, useCallback, useMemo, useState } from "react";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import {
	type Container,
	GlobalStyles,
	getBaseTheme,
	shouldForwardProp
} from "@com.mgmtp.a12.widgets/widgets-core";

const THEMES = ["base", "base_flat"] as const;
type Theme = (typeof THEMES)[number];

export type ThemeContextType = {
	themes: ReadonlyArray<Theme>;
	theme: Theme;
	setTheme(theme: Theme): void;
};

export const ThemeContext = createContext<ThemeContextType>({
	themes: THEMES,
	theme: THEMES[0],
	setTheme: () => {}
});

export const ThemeContextProvider = (props: Container) => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	const onSelectTheme = useCallback((theme: Theme) => {
		setTheme(theme);
		localStorage.setItem("theme", theme);
	}, []);

	const currentTheme = useMemo(() => {
		if (theme === "base_flat") {
			return getBaseTheme({ spacing: { base: 16 } });
		}
		return getBaseTheme();
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ themes: THEMES, theme, setTheme: onSelectTheme }}>
			<StyleSheetManager shouldForwardProp={shouldForwardProp}>
				<ThemeProvider theme={currentTheme}>
					<GlobalStyles />
					{props.children}
				</ThemeProvider>
			</StyleSheetManager>
		</ThemeContext.Provider>
	);
};

function getInitialTheme(): Theme {
	const theme = localStorage.getItem("theme") as Theme;

	return THEMES.includes(theme) ? theme : THEMES[0];
}
