// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
