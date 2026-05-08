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

import { ok, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act } from "react";
import { legacy_createStore as createStore } from "redux";

import { query } from "@com.mgmtp.a12.devtools/react";
import type { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { Localizer } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import type { ProgressIndicatorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.api.js";

import { ViewViews } from "../../../../core/view/index.js";
import { DE_LOCALE } from "../../../utils/localization.js";
import { render, type RenderResult } from "../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

describe("core.view.views", () => {
	describe("ProgressIndicator", () => {
		interface SetupResult {
			result: RenderResult;
			widgetProps?: ProgressIndicatorProps;
			childRendered: boolean;
		}

		async function setup(
			clientProgressIndicatorProps: Partial<ViewViews.ProgressIndicatorProps> = {},
			localizerFunction?: Localizer
		): Promise<SetupResult> {
			const contextValue = localizerContextValue();
			const store = createStore(() => ({ locale: contextValue.locale }));

			// don't use the real ProgressIndicator - we just want to verify
			// that it is rendered with the correct props
			//
			// also, the widget uses timers which would require mocking them
			const widgetMap = {
				ProgressIndicator: mock.fn()
			};

			// only used to verify that children are rendered
			const ChildSpy = mock.fn();

			const result = await act(() =>
				render(
					<TestWrapper
						store={store}
						localizerContextValue={contextValue}
						customWidgetMap={widgetMap}
					>
						<ViewViews.ProgressIndicator progress="loading" {...clientProgressIndicatorProps}>
							<ChildSpy />
						</ViewViews.ProgressIndicator>
					</TestWrapper>
				)
			);

			const widgetProps = query(widgetMap.ProgressIndicator).maybeProps();
			const childRendered = query(ChildSpy).propsHistory().length > 0;
			return {
				result,
				widgetProps,
				childRendered
			};

			function localizerContextValue(): LocalizerContext.Type {
				const locale = DE_LOCALE;
				const dataFormats = defaultDataFormats(locale);
				const conversion = defaultValueConversion(dataFormats);
				const localizer: Localizer =
					localizerFunction ?? defaultLocalizerFactory({ locale, dataFormats, conversion });
				return {
					locale,
					dataFormats,
					localizer,
					conversion
				};
			}
		}

		describe("progress", () => {
			it("renders its children and the progress indicator, when the progress prop is 'loading'", async () => {
				const progress = "loading";

				const { widgetProps, childRendered } = await setup({ progress });
				ok(widgetProps);
				strictEqual(childRendered, true);
			});

			it("renders its children and no progress indicator, when the progress prop is 'none'", async () => {
				const progress = "none";

				const { widgetProps, childRendered } = await setup({ progress });
				ok(undefined === widgetProps);
				strictEqual(childRendered, true);
			});

			it("renders its children and the progress indicator without the circle, when the progress prop is 'error'", async () => {
				const progress = "error";

				const { widgetProps, childRendered } = await setup({ progress });
				ok(widgetProps);
				ok(widgetProps.hideLoadingCircle);
				strictEqual(childRendered, true);
			});
		});

		describe("labels", () => {
			const TEST_LABELS: Record<string, string> = {
				"a.label.key.passed.as.prop": "a label for a key passed as prop"
			};

			const localizer: Localizer = localizable => TEST_LABELS[localizable.key];

			it("renders no label, when no label key is provided in its props", async () => {
				const { widgetProps } = await setup(undefined, localizer);

				ok(widgetProps);
				strictEqual(widgetProps.label, undefined);
			});

			it("renders the localized label of the label key provided in its props", async () => {
				const testKey = "a.label.key.passed.as.prop";

				const { widgetProps } = await setup({ labelKey: testKey }, localizer);

				strictEqual(widgetProps?.label, TEST_LABELS[testKey]);
			});
		});

		describe("appear", () => {
			it("renders the progress indicator with fastAppear enabled by default", async () => {
				const { widgetProps } = await setup();

				strictEqual(widgetProps?.fastAppear, true);
			});

			it("renders the progress indicator with fast appear enabled, when disableFastAppear is false in its props", async () => {
				const { widgetProps } = await setup({ disableFastAppear: false });

				strictEqual(widgetProps?.fastAppear, true);
			});

			it("renders the progress indicator with fast appear disabled, when disableFastAppear is true in its props", async () => {
				const { widgetProps } = await setup({ disableFastAppear: true });

				strictEqual(widgetProps?.fastAppear, false);
			});

			it("renders the progress indicator without any opening delay, when no delay is provided in its props", async () => {
				const { widgetProps } = await setup();

				strictEqual(widgetProps?.openingDelay, undefined);
			});

			it("renders the progress indicator with the opening delay of its props, when a delay is provided in its props", async () => {
				const delay = 12345;
				const { widgetProps } = await setup({ delay });

				strictEqual(widgetProps?.openingDelay, delay);
			});
		});

		describe("global", () => {
			it("renders the progress indicator with the global flag of its props when it is defined", async () => {
				const { widgetProps } = await setup({ global: true });

				strictEqual(widgetProps?.global, true);
			});

			it("renders the progress indicator with the global flag = false when it is not defined in its props", async () => {
				const { widgetProps } = await setup({});

				strictEqual(widgetProps?.global, false);
			});
		});

		describe("style", () => {
			it("renders its root component with the style provided in its props", async () => {
				const style = { backgroundColor: "red" };
				const { result } = await setup({ style });

				strictEqual(getRootElementStyle(result).backgroundColor, "red");

				function getRootElementStyle(result: RenderResult): CSSStyleDeclaration {
					return (result.baseElement.firstElementChild?.firstElementChild as HTMLElement)?.style;
				}
			});
		});
	});
});
