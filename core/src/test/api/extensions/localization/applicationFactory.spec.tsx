// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { equal } from "node:assert/strict";
import { mock } from "node:test";

import { Fragment, useContext, type ComponentType, type Context } from "react";

import { query, render } from "@com.mgmtp.a12.devtools/react";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { A11yDefinition } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/a11y-localization/a11y-key-definition.api.js";
import { A11YLanguageContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/a11y-localization/language-context.js";
import {
	DateTimeContext,
	type DateTimeContextType
} from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/date-time/date-time-context.js";
import type { ListItemProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.api.js";
import type { PopUpMenuProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/pop-up-menu/main/pop-up-menu.api.js";

import { assertObject } from "../../../../core/assertion.js";
import { FrameViews } from "../../../../core/frame/internal/views.js";
import {
	addLocaleChooser,
	addLocalizationContextProvider,
	type ApplicationWithLocalizationSupportConfig,
	type LocalizedLocale
} from "../../../../extensions/localization/index.js";
import { errorBoundaryProviderMock } from "../../../mocks/frame/ErrorBoundaryProviderMock.js";
import LayoutProviderMock from "../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../mocks/frame/RegionUiMock.js";
import { viewProviderMock } from "../../../mocks/frame/viewProvider.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

const LOCALE_ENGLISH = {
	country: "US",
	language: "en",
	name: {
		key: "key",
		defaults: { en: "English" }
	}
} as const satisfies LocalizedLocale;

const LOCALE_GERMAN = {
	country: "DE",
	language: "de",
	name: {
		key: "key",
		defaults: { en: "German" }
	}
} as const satisfies LocalizedLocale;

describe("extensions.localizations.applicationFactory", () => {
	describe("addLocaleChooser", () => {
		it("is not adding the locale chooser if 'addLocaleChooser' is 'never'", () => {
			const config: ApplicationWithLocalizationSupportConfig = {
				config: {},
				localization: {
					supportedLocales: [LOCALE_ENGLISH],
					addLocaleChooser: "never"
				}
			};

			const result = addLocaleChooser(config);
			equal(result.config.layoutModifications?.("FrameLayout"), undefined);
		});

		it("is not adding the locale chooser if 'addLocaleChooser' is 'on-demand' and only one locale is supported", () => {
			const config: ApplicationWithLocalizationSupportConfig = {
				config: {},
				localization: {
					supportedLocales: [LOCALE_ENGLISH],
					addLocaleChooser: "on-demand"
				}
			};

			const result = addLocaleChooser(config);
			equal(result.config.layoutModifications?.("FrameLayout"), undefined);
		});

		it("is adding the locale chooser if 'addLocaleChooser' is 'on-demand' and multiple locales are supported", () => {
			const config: ApplicationWithLocalizationSupportConfig = {
				config: {},
				localization: {
					supportedLocales: [LOCALE_ENGLISH, LOCALE_GERMAN],
					addLocaleChooser: "on-demand"
				}
			};
			assertLocaleChooser(config);
		});

		it("is adding the locale chooser if 'addLocaleChooser' is 'always', even if no locales are provided", () => {
			const config: ApplicationWithLocalizationSupportConfig = {
				config: {},
				localization: {
					supportedLocales: [],
					addLocaleChooser: "always"
				}
			};
			assertLocaleChooser(config);
		});
	});

	describe("addLocalizationContextProvider", () => {
		it("adds the correct contexts", () => {
			const expectedLocale = { country: "DE", language: "de" };
			const expectedDateTimeLocale = {} as DateTimeContextType;
			const config: ApplicationWithLocalizationSupportConfig = {
				config: {},
				localization: {
					getDateTimeResource: () => expectedDateTimeLocale,
					supportedLocales: [LOCALE_ENGLISH]
				}
			};
			const assertLocalizerContext = (value: LocalizerContext.Type) => {
				equal(value.locale, expectedLocale);
			};

			const assertA11yContext = (value: A11yDefinition) => {
				// the default context value by Widgets contains english ("Entries")
				equal(value.counterTitles?.counterUnit, "Einträge");
			};

			const assertDateTimeContext = (value: DateTimeContextType) => {
				equal(value, expectedDateTimeLocale);
			};

			const result = addLocalizationContextProvider(config);
			const Wrapper = result.config.WrapperComponent ?? Fragment;
			render(
				<TestWrapper testSetupConfig={{ locale: expectedLocale }}>
					<Wrapper>
						<AssertContext context={LocalizerContext} assertion={assertLocalizerContext} />
						<AssertContext context={A11YLanguageContext} assertion={assertA11yContext} />
						<AssertContext context={DateTimeContext} assertion={assertDateTimeContext} />
					</Wrapper>
				</TestWrapper>
			);
		});
	});
});

type AssertContextProps<T> = {
	context: Context<T>;
	assertion: (value: T) => void;
};

function AssertContext<T>({ context, assertion }: AssertContextProps<T>) {
	const contextToAssert = useContext(context);
	assertion(contextToAssert);
	return null;
}

function assertLocaleChooser(config: ApplicationWithLocalizationSupportConfig) {
	const result = addLocaleChooser(config);

	const NewLayout = result.config.layoutModifications?.("ApplicationFrame")?.({
		component: FrameViews.ApplicationFrameLayout
	}).component;
	assertObject(NewLayout);

	const PopUpMenu = mock.fn<ComponentType<PopUpMenuProps>>(props => props.children);
	const ListItem = mock.fn<ComponentType<ListItemProps>>();
	render(
		<TestWrapper customWidgetMap={{ PopUpMenu, ListItem }}>
			<NewLayout
				regionReference={[]}
				layoutProvider={LayoutProviderMock}
				regionUiProvider={regionUiProviderMock}
				viewProvider={viewProviderMock}
				progressComponentProvider={progressComponentProviderMock}
				errorBoundaryProvider={errorBoundaryProviderMock}
				views={[]}
			/>
		</TestWrapper>
	);
	query(PopUpMenu).withTestId("LocaleChooser").assertRenderedTimes(1);
	const listQuery = query(ListItem).groupBy("text");
	listQuery.assertSize(config.localization.supportedLocales.length);
	for (let i = 0; i < config.localization.supportedLocales.length; i++) {
		const expectedText = config.localization.supportedLocales[i].name?.defaults?.en;
		equal(listQuery.at(i).props().text, expectedText);
	}
}
