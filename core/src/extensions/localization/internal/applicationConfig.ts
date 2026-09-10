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

import type {
	defaultLocalizerFactory,
	Localizable
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";
import type { DateTimeContextType } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/date-time/date-time-context.js";
import type { TimePickerProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/time-picker/main/time-picker.api.js";

import type {
	A12ApplicationConfig,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";

/**
 * @experimental
 */
export type LocalizedLocale = Locale & { name?: Localizable };

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		localization: {
			/**
			 * A function that returns a "date-fn/locale" for a given A12 locale. It is used to create
			 * a Widget DateTimeContext. Should be provided if you use Date-/Time-Picker Widgets and
			 * localizations other then en_US, which is the default.
			 */
			getDateTimeResource?: (locale: Locale) => DateTimeContextType;
			supportedLocales: LocalizedLocale[];
			translationSource?: Parameters<typeof defaultLocalizerFactory>[0]["translationSource"];
			timeMode?: TimePickerProps.ClockMode;
			/**
			 * Whether to add the locale chooser to the application frame layout.
			 * `on-demand` will only add it if more than one locale is supported.
			 *
			 * @default "on-demand"
			 */
			addLocaleChooser?: "always" | "never" | "on-demand";
		};
	}
}

/**
 * @experimental
 */
export type ApplicationWithLocalizationSupportConfig = RequireFeatures<
	A12ApplicationConfig,
	{ localization?: never }
>;
