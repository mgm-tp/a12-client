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

import type { JSX } from "react";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import {
	FrameFactories,
	LayoutProvidersContext,
	LocaleSelectors
} from "@com.mgmtp.a12.client/client-core";
import { DirtyHandlingViews } from "@com.mgmtp.a12.client/client-core/dirtyHandling";
import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import {
	A11YLanguageContext,
	getA11yResource,
	SizeContext,
	useWindowSize
} from "@com.mgmtp.a12.widgets/widgets-core";

import { SAMPLE_APPLICATION_TRANSLATIONS } from "../config/resources.js";
import { CustomNotificationFrame } from "../modules/ui_handling/notifications/CustomNotificationFrame.js";

import { legacyLayoutProvider } from "./layoutProvider.js";

const ROOT_REGION_REF: ApplicationModel.Region.Reference = [];

const RegionUiComponent = FrameFactories.regionUiProvider(ROOT_REGION_REF);

export function LegacyDevApp(): JSX.Element {
	const locale = useSelector(LocaleSelectors.locale());
	const { breakPoint } = useWindowSize();

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

	const layoutProviders = useContext(LayoutProvidersContext);

	return (
		<SizeContext.Provider value={{ currentSize: breakPoint.size }}>
			<LocalizerContext.Provider value={localizerCtx}>
				<A11YLanguageContext.Provider value={getA11yResource(locale.language)}>
					<DirtyHandlingViews.VetoDialog>
						<CustomNotificationFrame>
							<RegionUiComponent
								{...layoutProviders}
								regionReference={ROOT_REGION_REF}
								layoutProvider={legacyLayoutProvider}
							/>
						</CustomNotificationFrame>
					</DirtyHandlingViews.VetoDialog>
				</A11YLanguageContext.Provider>
			</LocalizerContext.Provider>
		</SizeContext.Provider>
	);
}
