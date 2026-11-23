// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext, type JSX, type PropsWithChildren } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { shouldForwardProp } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/should-forward-prop.js";
import type { SizeContextProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { useWindowSize } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.view.js";
import { GlobalStyles } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/base/global-styles.js";
import { defaultTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/default/default-theme.js";

import { ClientWidgetMapContext, type ClientWidgetMap } from "../../../core/ClientWidgetMap.js";

import { US_LOCALE } from "../localization.js";
import { createApplicationSetup, type Config } from "../test-utils.js";

export interface TestWrapperProps extends TestInnerWrapperProps {
	readonly store?: Store<object>;
	readonly testSetupConfig?: Config;
}

export function TestWrapper({
	store,
	testSetupConfig,
	children,
	...rest
}: TestWrapperProps): JSX.Element {
	return (
		<Provider store={store ?? createApplicationSetup(testSetupConfig).store}>
			<TestInnerWrapper {...rest}>{children}</TestInnerWrapper>
		</Provider>
	);
}

interface TestInnerWrapperProps extends PropsWithChildren {
	readonly sizeContextValue?: SizeContextProps;
	readonly localizerContextValue?: LocalizerContext.Type;
	readonly customWidgetMap?: Partial<ClientWidgetMap>;
}

function TestInnerWrapper(props: TestInnerWrapperProps) {
	const windowSize = useWindowSize();
	const sizeContextValue: SizeContextProps = props.sizeContextValue ?? {
		currentSize: windowSize.breakPoint.size
	};

	const locale = US_LOCALE;
	const dataFormats = defaultDataFormats(locale);
	const conversion = defaultValueConversion(dataFormats);

	const localizerContextValue: LocalizerContext.Type = props.localizerContextValue ?? {
		locale,
		dataFormats,
		conversion,
		localizer: defaultLocalizerFactory({
			locale,
			conversion,
			dataFormats
		})
	};

	const defaultWidgetMap = useContext(ClientWidgetMapContext);

	const widgetMap = {
		...defaultWidgetMap,
		...props.customWidgetMap
	};

	return (
		<SizeContext.Provider value={sizeContextValue}>
			<StyleSheetManager shouldForwardProp={shouldForwardProp}>
				<ThemeProvider theme={defaultTheme}>
					<GlobalStyles />
					<LocalizerContext.Provider value={localizerContextValue}>
						<ClientWidgetMapContext.Provider value={widgetMap}>
							{props.children}
						</ClientWidgetMapContext.Provider>
					</LocalizerContext.Provider>
				</ThemeProvider>
			</StyleSheetManager>
		</SizeContext.Provider>
	);
}
