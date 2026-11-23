// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback, useContext, useMemo, useState } from "react";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ContentBox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { TabPanel } from "@com.mgmtp.a12.widgets/widgets-core/lib/tab-panel/main/tab-panel.view.js";
import type { TabPanelTemplateProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/tab-panel/main/template/tab-panel.tpl.api.js";
import { TabPanelTemplate } from "@com.mgmtp.a12.widgets/widgets-core/lib/tab-panel/main/template/tab-panel.tpl.view.js";

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

	const [tab, setTab] = useState<TabPanelTemplateProps.TabProps>(tabPanelData[0]);

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
								key={"maximize"}
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
