// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
