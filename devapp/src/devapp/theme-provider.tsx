// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { createContext, useCallback, useMemo, useState } from "react";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import type { Container } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/base-props.js";
import { shouldForwardProp } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/should-forward-prop.js";
import { GlobalStyles } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/base/global-styles.js";
import { compactTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/compact/compact-theme.js";
import { defaultTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/default/default-theme.js";
import { flatCompactTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/flat-compact/flat-compact-theme.js";
import { flatTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/flat/flat-theme.js";

const THEMES = ["default", "compact", "flat", "flat_compact"] as const;
type Theme = (typeof THEMES)[number];

export type ThemeContextType = {
	themes: ReadonlyArray<Theme>;
	theme: Theme;
	setTheme(theme: Theme): void;
};

export const ThemeContext = createContext<ThemeContextType>({
	themes: THEMES,
	theme: "default",
	setTheme: () => {}
});

export const ThemeContextProvider = (props: Container) => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	const onSelectTheme = useCallback((theme: Theme) => {
		setTheme(theme);
		localStorage.setItem("theme", theme);
	}, []);

	const currentTheme = useMemo(() => {
		if (theme === "flat") {
			return flatTheme;
		}
		if (theme === "compact") {
			return compactTheme;
		}
		if (theme === "flat_compact") {
			return flatCompactTheme;
		}
		return defaultTheme;
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
