// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import {
	initializeKeys,
	type LocalizationTreeMap
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";
import type { SelectProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.api.js";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { LocaleActions, LocaleSelectors } from "../../../locale/index.js";

export interface LocaleSelectProps {
	readonly hideLabel?: boolean;
	readonly locales: Locale[];
	/**
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 *
	 * A map of components, that will be used instead of the corresponding
	 * default components, if they are provided.
	 */
	readonly widgetMap?: {
		/**
		 * Used instead the default select widget, if provided.
		 */
		readonly Select?: ComponentType<SelectProps>;
	};
}

/**
 * A ready-to-use component to select the locale. It reads and writes the locale
 * from/to the store.
 *
 * The label can be hidden in an A11Y-friendly way using hideLabel.
 *
 * For the supported l10n keys, please see LOCALE_SELECT_RESOURCE_KEYS.
 */
export function LocaleSelect(props: LocaleSelectProps): JSX.Element {
	const currentLocale = useSelector(LocaleSelectors.locale());
	const localizer = useContext(LocalizerContext).localizer;

	const { Select } = useContext(ClientWidgetMapContext);

	const label = localizer(
		localizableFromLocalizationTreeMap(LOCALE_SELECT_RESOURCE_KEYS.LocaleSelect.label, DEFAULT_L10N)
	);

	const options = props.locales.map(locale => ({
		label:
			localizer(
				localizableFromLocalizationTreeMap(
					`${LOCALE_SELECT_RESOURCE_KEYS.LocaleSelect.locale}.${Locale.toString(locale)}`,
					DEFAULT_L10N
				)
			) ?? "",
		value: Locale.toString(locale)
	}));

	const dispatch = useDispatch();
	const onValueChanged = (locale: Locale) => {
		dispatch(LocaleActions.set(locale));
	};

	// TODO: Remove with A12-17777
	// oxlint-disable-next-line typescript/no-deprecated
	const SelectComponent = props.widgetMap?.Select ?? Select;

	return (
		<SelectComponent
			label={label}
			hideLabel={props.hideLabel}
			value={Locale.toString(currentLocale)}
			items={options}
			onValueChanged={value => onValueChanged(Locale.fromString(value) as Locale)}
		/>
	);
}

/**
 * Resource keys of LocaleSelect component.
 *
 * Please note that adding new keys to this object is not considered as a breaking change.
 */
export const LOCALE_SELECT_RESOURCE_KEYS = {
	LocaleSelect: {
		/** Key of the label */
		label: "",
		/** Keys of the locales (keys are in format of Locale.toString) */
		locale: ""
	}
};

const DEFAULT_L10N: LocalizationTreeMap = {
	en: {
		LocaleSelect: {
			label: "Locale",
			locale: {
				de_DE: "German (Germany)",
				en_US: "English (US)"
			} as { [key: string]: string }
		}
	},
	de: {
		LocaleSelect: {
			label: "Gebietsschema",
			locale: {
				de_DE: "Deutsch (Deutschland)",
				en_US: "Englisch (US)"
			} as { [key: string]: string }
		}
	}
};

initializeKeys(LOCALE_SELECT_RESOURCE_KEYS);
