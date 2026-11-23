// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { Module } from "@com.mgmtp.a12.client/client-core";
import { ModuleRegistryProvider } from "@com.mgmtp.a12.client/client-core";

interface ModuleSpecificProps {}

// tag::extension[]
export abstract class MyAbstractModule implements Module {
	id = "myAbstractModule";

	// ...

	moduleSpecificRenderer(): (props: ModuleSpecificProps) => JSX.Element | undefined {
		return props => undefined;
	}
}

export namespace MyModuleExtensions {
	export function getRenderer(): (props: ModuleSpecificProps) => JSX.Element {
		return props => {
			for (const module of ModuleRegistryProvider.getInstance().getAllModules()) {
				if (module instanceof MyAbstractModule) {
					const result = module.moduleSpecificRenderer()(props);
					if (result) {
						return result;
					}
				}
			}
			return <div>{/* ... default View */}</div>;
		};
	}
}
// end::extension[]
