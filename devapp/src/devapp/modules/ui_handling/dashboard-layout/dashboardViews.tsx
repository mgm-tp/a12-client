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

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Tile } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/tile/tile.view.js";

import type { ArticleData } from "./articleDataLoader.js";

export default function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

function DashboardIntroTile(props: View): JSX.Element {
	return (
		<Tile
			title="Dashboard (Single Activity)"
			color="#056294"
			icon="info"
			ariaLevel={props.ariaLevel}
		>
			<h3>Layout</h3>
			<p>
				For the DashboardLayout, the geometry defines the configuration of the dashboard&apos;s
				tiles. It consists of a list of rows. Each row contains either a number of slots or a list
				of container columns. The width of each slot or column can be configured using the Dashboard
				Widget&apos;s ColumnSize configuration. Container columns in turn again contain nested rows.
			</p>
			<h3>Configuration in Application Model</h3>
			<p>
				In the body of the application model, directives reconfigure the UI. Specifically, the
				CLEAR_REGION directive can change the layout of a region. It can have (optional) geometry
				information which can be used by the layout to position it&apos;s slots (placeholders into
				which the views are placed). The structure of the geometry information is therefore layout
				specific.
			</p>
			<p>
				There is only one activity that is responsible for setting up this dashboard. Be aware, that
				all tiles share the same progress indicator of this single activity
			</p>
			<p>
				The scene &quot;DashboardSingleActivity&quot; sets up the dashboard layout with rows and
				columns. It also adds five views as dashboard tiles via the VIEW_ADD directives.
			</p>
		</Tile>
	);
}

function MultipleActivitiesDashboardIntroTile(props: View): JSX.Element {
	return (
		<Tile
			title="Dashboard (Multiple Activities)"
			color="#0aa294"
			icon="info"
			ariaLevel={props.ariaLevel}
		>
			<h3>Layout</h3>
			<p>
				For the DashboardLayout, the geometry defines the configuration of the dashboard&apos;s
				tiles. It consists of a list of rows. Each row contains either a number of slots or a list
				of container columns. The width of each slot or column can be configured using the Dashboard
				Widget&apos;s ColumnSize configuration. Container columns in turn again contain nested rows.
			</p>
			<h3>Configuration in Application Model</h3>
			<p>
				In the body of the application model, directives reconfigure the UI. Specifically, the
				CLEAR_REGION directive can change the layout of a region. It can have (optional) geometry
				information which can be used by the layout to position it&apos;s slots (placeholders into
				which the views are placed). The structure of the geometry information is therefore layout
				specific.
			</p>
			<p>
				There is one activity for each tile of the dashboard. Consequently, each tile has its own
				progress indicator.
			</p>
			<p>
				In the application model, we configure one scene named
				&quot;DashboardMultipleActivities&quot;.
			</p>
			<ul>
				<li>This scene sets up the dashboard layout with two rows and two columns.</li>
				<li>
					The next four scenes &quot;DashboardSceneIntroTile&quot;,
					&quot;DashboardSceneArticleTile&quot;, &quot;DashboardSceneOverviewCrudTile&quot; and
					&quot;DashboardSceneOverviewOfferTile&quot; add four view components as tiles to the
					dashboard.
				</li>
				<li>
					The sixth and seventh scene &quot;DashboardSceneOverviewCrudDetail&quot; and
					&quot;DashboardSceneOverviewOfferDetail&quot; are activated when the user interacts with
					one of the &quot;CRUD Overview&quot; views. When a row is selected, it changes the layout
					to MasterDetail and shows the details of the entry within the &quot;CRUD Form&quot; view.
				</li>
			</ul>
			<h3>Additional Dashboard Saga</h3>
			To be able to create one activity per tile, we implement an additional Saga
			<pre>createMultipleActivitiesForDashboard()</pre>
			which listens for an action with a specific payload. The payload needs to contain an activity
			descriptor with <pre>{`{ tile: "DashboardMultipleActivities" }`}</pre> which we defined in the
			menu property of the module &quot;DashboardMultipleActivities&quot; within the application
			model. The Saga then triggers the creation of four activities, one for each tile in our
			dashboard.
		</Tile>
	);
}

function DashboardCalendarTile(props: View): JSX.Element {
	return (
		<Tile title="Calendar" color="#00686b" icon="calendar_today" ariaLevel={props.ariaLevel} />
	);
}

function DashboardArticleTile({ activityId, ariaLevel }: View): JSX.Element {
	const data = useSelector(ActivitySelectors.data(activityId)) as ArticleData | undefined;
	return (
		<Tile
			title="Article (resolves data after 3500 ms)"
			color="#00686b"
			icon="assignment"
			ariaLevel={ariaLevel}
		>
			<p>{data?.text}</p>
		</Tile>
	);
}

function DashboardNotesTile(props: View): JSX.Element {
	return <Tile title="Notes" color="#00686b" icon="speaker_notes" ariaLevel={props.ariaLevel} />;
}

function DashboardTasksTile(props: View): JSX.Element {
	return <Tile title="Tasks" color="#bb006c" icon="list" ariaLevel={props.ariaLevel} />;
}

function DashboardMessagesTile(props: View): JSX.Element {
	return <Tile title="Messages" color="#bb006c" icon="list" ariaLevel={props.ariaLevel} />;
}

const Views: { [name: string]: View.ViewComponent } = {
	DashboardIntroTile,
	MultipleActivitiesDashboardIntroTile,
	DashboardCalendarTile,
	DashboardArticleTile,
	DashboardNotesTile,
	DashboardTasksTile,
	DashboardMessagesTile
};
