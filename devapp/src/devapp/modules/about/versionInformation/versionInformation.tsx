// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { VersionInfo } from "./dependencies.js";
import appmodel from "./versionInformation.appmodel.json" with { type: "json" };

declare const __VERSION__: string | undefined;
const version = typeof __VERSION__ !== "undefined" ? __VERSION__ : "missing __VERSION__";

const VersionInfoModule: SampleAppModule = {
	id: "about.versionInfo",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	VersionInfoComponent
};

function VersionInfoComponent(props: View): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;
	return (
		<VersionInfo
			version={version}
			currentVersionLabel={localizer({ key: "version.info.currentVersion.label" }) ?? ""}
			ariaLevel={props.ariaLevel}
		/>
	);
}

export default VersionInfoModule;
