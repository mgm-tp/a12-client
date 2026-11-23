// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, ReactElement } from "react";
import { useState } from "react";

import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

export interface DescriptionPanelProps {
	readonly title: string;
	readonly open?: boolean;
	readonly children: ReactElement;
}
export function DescriptionPanel(props: DescriptionPanelProps): JSX.Element {
	const [generalDescriptionOpen, setGeneralDescriptionOpen] = useState(props.open === true);
	return (
		<Typography.Section>
			<Typography.Headline
				level={3}
				collapsible
				collapsed={!generalDescriptionOpen}
				onCollapsingChange={() => setGeneralDescriptionOpen(!generalDescriptionOpen)}
			>
				{props.title}
			</Typography.Headline>
			{generalDescriptionOpen ? <Typography.Body>{props.children}</Typography.Body> : null}
		</Typography.Section>
	);
}
