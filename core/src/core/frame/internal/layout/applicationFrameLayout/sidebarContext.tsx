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

import { createContext, useMemo, type ComponentType } from "react";

import type { Container } from "@com.mgmtp.a12.widgets/widgets-core";

export const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);
export interface SidebarContextProps {
	/** Whether the sidebar is expanded or not */
	readonly subExpanded: boolean;
	/** Callback to set the expansion state of the sidebar */
	setSubExpanded(expanded: boolean): void;
	/** Whether the sidebar is maximized or not */
	readonly subExpandedState?: "minimized" | "maximized";
	/** Callback to maximize or minimize the sidebar */
	setSubExpandedState?(value?: "minimized" | "maximized"): void;
}
SidebarContext.displayName = "SidebarContext";

/** @internal */
export interface SidebarContextMemoWrapperProps extends Container {
	contextValue: SidebarContextProps | undefined;
}
// extracted to functional component so that we can useMemo
/** @internal */
export const SidebarContextMemoWrapper: ComponentType<SidebarContextMemoWrapperProps> = props => {
	const cv = props.contextValue;
	const deps = [cv?.subExpanded, cv?.setSubExpanded, cv?.subExpandedState, cv?.setSubExpandedState];
	// eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
	const memoProps = useMemo(() => props.contextValue, deps);
	return <SidebarContext.Provider value={memoProps}>{props.children}</SidebarContext.Provider>;
};
