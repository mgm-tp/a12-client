// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// side effect imports need to come before everything else
import "./environment.js";
import "./whyDidYouRender.js";
import { mock } from "node:test";

import { assertNoUnnecessaryRenderings } from "@com.mgmtp.a12.devtools/why-did-you-render";
import { Settings } from "@com.mgmtp.a12.utils/utils-logging";
import { ResponsiveHandler } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/responsive-handler.js";

// install root hooks, see https://mochajs.org/#root-hook-plugins
export const mochaHooks = {
	beforeEach() {
		/**
		 * This stubs ResponsiveHandler.getNonCondensedItemNumber from Widgets and
		 * always returns the number of all given items.
		 *
		 * The original method is used to determine how many items can be displayed in
		 * some container, depending on the width of the corresponding elements.
		 * It uses the method Element.getBoundingClientRect, which only works in the
		 * real DOM. During tests it always returns an object containing only zeros.
		 * Therefore, it is necessary to mock this method here. Otherwise, e.g. MainMenu
		 * items cannot be rendered correctly.
		 */
		mock.method(
			ResponsiveHandler,
			"getNonCondensedItemNumber",
			(_: unknown, items: unknown[]) => items.length
		);
	},

	afterEach(this: Mocha.Context) {
		mock.reset();
		window.localStorage.clear();
		Settings.resetLogLevel();
		Settings.resetLogStrategy();

		/**
		 * Re-renderings are checked after each test to ensure nothing is missed
		 *
		 * Since errors in mocha hooks will stop mocha from executing the rest of the suite,
		 * the test is "marked as failed" manually
		 */
		try {
			assertNoUnnecessaryRenderings();
		} catch (error) {
			this.test?.emit("error", error);
		}
	}
};
