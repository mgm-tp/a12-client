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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { JSX } from "react";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";

import type { FrameViews, RegionReferenceNG } from "@com.mgmtp.a12.client/client-core";
import {
	ApplicationSelectors,
	DynamicRegionUi,
	FrameFactories,
	LayoutProvidersContext,
	LocaleSelectors,
	ViewViews
} from "@com.mgmtp.a12.client/client-core";
import { DirtyHandlingViews } from "@com.mgmtp.a12.client/client-core/dirtyHandling";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { defaultValueConversion } from "@com.mgmtp.a12.utils/utils-localization/lib/main/conversion.js";
import { defaultDataFormats } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/DataFormats.js";
import { defaultLocalizerFactory } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/defaultLocalizerFactory.js";
import {
	A11YLanguageContext,
	getA11yResource
} from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/a11y-localization/language-context.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { useWindowSize } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.view.js";

import { createProgressComponentProvider } from "./componentProvider/progressComponentProvider.js";
import { DevAppContext } from "./components/devAppContext.js";
import SAMPLE_APPLICATION_TRANSLATIONS from "./config/resources.js";
import { CustomNotificationFrame } from "./modules/ui_handling/notifications/CustomNotificationFrame.js";
import { ThemeContextProvider } from "./theme-provider.js";

// Parts of the app that are always rendered
export function Devapp(): JSX.Element {
	const locale = useSelector(LocaleSelectors.locale());
	const busy = useSelector(ApplicationSelectors.busy());

	const localizerCtx = useMemo(() => {
		const dataFormats = defaultDataFormats(locale);
		const conversion = defaultValueConversion(dataFormats);
		const localizer = defaultLocalizerFactory({
			locale: locale,
			conversion,
			dataFormats,
			translationSource: SAMPLE_APPLICATION_TRANSLATIONS
		});

		return { locale, dataFormats, localizer, conversion };
	}, [locale]);

	return (
		<LocalizerContext.Provider value={localizerCtx}>
			<A11YLanguageContext.Provider value={getA11yResource(locale.language)}>
				<DirtyHandlingViews.VetoDialog>
					<CustomNotificationFrame>
						<ViewViews.ProgressIndicator progress={busy ? "loading" : "none"} global>
							<Page />
						</ViewViews.ProgressIndicator>
					</CustomNotificationFrame>
				</DirtyHandlingViews.VetoDialog>
			</A11YLanguageContext.Provider>
		</LocalizerContext.Provider>
	);
}

const progressComponentProvider = createProgressComponentProvider(500);

const globalRegionReference: RegionReferenceNG = "GLOBAL";

function Page(): JSX.Element {
	const viewProvider = useContext(DevAppContext);

	const layoutProviders: FrameViews.ProviderProps = {
		layoutProvider: FrameFactories.layoutProvider,
		regionUiProvider: FrameFactories.regionUiProvider,
		viewProvider,
		progressComponentProvider
	};

	return (
		<LayoutProvidersContext.Provider value={layoutProviders}>
			<DynamicRegionUi />
			<DynamicRegionUi regionRef={globalRegionReference} />
		</LayoutProvidersContext.Provider>
	);
}

export function ResizableDevApp(): JSX.Element {
	const { breakPoint } = useWindowSize();

	return (
		<SizeContext.Provider value={{ currentSize: breakPoint.size }}>
			<ThemeContextProvider>
				<Devapp />
			</ThemeContextProvider>
		</SizeContext.Provider>
	);
}
