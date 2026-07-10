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
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
	initializeKeys,
	Locale,
	localizableFromLocalizationTreeMap,
	type LocalizationTreeMap
} from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { LocaleActions, LocaleSelectors } from "../../../locale/index.js";

export interface LocaleSelectProps {
	readonly hideLabel?: boolean;
	readonly locales: Locale[];
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

	return (
		<Select
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
