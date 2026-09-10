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

import "@com.mgmtp.a12.widgets/widgets-core/lib/theme/basic.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { createViewProvider } from "./componentProvider/viewProvider.js";
import { DevAppContext } from "./components/devAppContext.js";
import { ResizableDevApp } from "./general.devapp.js";
import type { CustomSetup } from "./steps/factories.js";
import { DevAppActions } from "./store/actions.js";

export async function devAppMain(
	config: CustomSetup,
	initialStoreActions: (setup: CustomSetup) => Promise<void> = () => Promise.resolve()
): Promise<void> {
	const mountpoint = document.getElementById("root") as HTMLDivElement;

	const root = createRoot(mountpoint);

	root.render(
		<StrictMode>
			<Provider store={config.store}>
				<DevAppContext.Provider value={createViewProvider(config.store)}>
					<ResizableDevApp />
				</DevAppContext.Provider>
			</Provider>
		</StrictMode>
	);

	await initialStoreActions(config);
	config.store.dispatch(DevAppActions.initialization.started());
}
