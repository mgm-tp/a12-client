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

import { useContext, type JSX, type PropsWithChildren } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization";
import {
	LocalizerContext,
	type LocalizerContextProps
} from "@com.mgmtp.a12.utils/utils-localization-react";
import {
	GlobalStyles,
	SizeContext,
	getBaseTheme,
	shouldForwardProp,
	useWindowSize,
	type SizeContextProps
} from "@com.mgmtp.a12.widgets/widgets-core";

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
	readonly localizerContextValue?: LocalizerContextProps;
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

	const localizerContextValue: LocalizerContextProps = props.localizerContextValue ?? {
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
				<ThemeProvider theme={getBaseTheme()}>
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
