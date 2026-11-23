// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { createContext } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";

export function Placeholder(props: View): JSX.Element {
	return <div>No view renderer found: &quot;{props.name}&quot;</div>;
}
export const DevAppContext = createContext<View.Provider>(() => Placeholder);
DevAppContext.displayName = "DevAppContext";
