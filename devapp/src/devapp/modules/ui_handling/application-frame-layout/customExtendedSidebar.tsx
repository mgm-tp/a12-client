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
import { useCallback, useContext, useMemo, useState } from "react";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import {
	Button,
	ContentBox,
	Icon,
	TabPanel,
	type TabPanelTemplateProps,
	TabPanelTemplate
} from "@com.mgmtp.a12.widgets/widgets-core";

import { InformationPanel } from "./panels/InformationPanel.js";
import { SearchPanel } from "./panels/SearchPanel.js";

const { PanelHeader } = TabPanelTemplate;

export function CustomExtendedSidebar(props: ViewNGProps): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;

	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	const maximized = sidebarContextProps?.subExpandedState === "maximized";
	const setMaximized = sidebarContextProps?.setSubExpandedState;
	const expanded = sidebarContextProps?.subExpanded;

	const tabPanelData: TabPanelTemplateProps.TabProps[] = [
		{
			icon: <Icon>info</Icon>,
			value: "information",
			title: localizer({ key: "examples.ui-handling.tabPanel.informationPanel.title" })
		},
		{
			icon: <Icon>search</Icon>,
			value: "search",
			title: localizer({ key: "examples.ui-handling.tabPanel.searchPanel.title" })
		}
	];

	const [tab, setTab] = useState<TabPanelTemplateProps.TabProps | undefined>(tabPanelData.at(0));

	const value = !expanded ? undefined : tab?.value;
	const panel = useMemo(() => {
		return (
			value && (
				<ContentBox heading={undefined}>
					<Panel value={value} activityId={props.activityId} />
				</ContentBox>
			)
		);
	}, [props.activityId, value]);

	const handleCloseTab = useCallback(() => {
		if (sidebarContextProps?.setSubExpanded !== undefined) {
			sidebarContextProps.setSubExpanded(false);
		}
	}, [sidebarContextProps]);

	const handleSelect = useCallback(
		(newTab: TabPanelTemplateProps.TabProps) => {
			if (newTab.value === tab?.value && expanded) {
				handleCloseTab();
			} else {
				setTab(newTab);
				if (sidebarContextProps?.setSubExpanded !== undefined) {
					sidebarContextProps.setSubExpanded(true);
				}
			}
		},
		[tab, expanded, handleCloseTab, sidebarContextProps]
	);

	return (
		<TabPanel
			onSelect={handleSelect}
			value={value}
			tabs={tabPanelData}
			header={
				<PanelHeader
					suffixes={[
						setMaximized ? (
							<Button
								icon={<Icon>{maximized ? "fullscreen_exit" : "fullscreen"}</Icon>}
								invert
								onClick={() => setMaximized(maximized ? "minimized" : "maximized")}
								title={
									maximized
										? localizer({ key: "examples.ui-handling.tabPanel.minimize" })
										: localizer({ key: "examples.ui-handling.tabPanel.maximize" })
								}
							/>
						) : null,
						<Button
							key={"close"}
							icon={<Icon>close</Icon>}
							invert
							onClick={handleCloseTab}
							title={localizer({ key: "examples.ui-handling.tabPanel.close" })}
						/>
					]}
				/>
			}
			id="side-bar-with-tab-panel"
		>
			{panel}
		</TabPanel>
	);
}

interface PanelProps {
	activityId: string;
	value?: string;
}

function Panel(props: PanelProps): JSX.Element {
	return props.value === "search" ? (
		<SearchPanel activityId={props.activityId} />
	) : (
		<InformationPanel />
	);
}
