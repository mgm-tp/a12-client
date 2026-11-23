// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { type JSX, useContext } from "react";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { berlinImage, hamburgImage } from "./images.js";

export function ContactView(): JSX.Element {
	const { localizer } = useContext(LocalizerContext);
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text={localizer({ key: "examples.about.contact.menuEntry" })}
					ariaLevel={1}
				/>
			}
		>
			<br />
			<div className={addPrefix("-u-flex")}>
				<img src={berlinImage} alt="berlin office" style={{ width: "150px", height: "150px" }} />
				<div className={addPrefix("-u-margin-l-md")}>
					<span>
						<strong>Berlin</strong>
						<br />
						mgm technology partners gmbh
						<br />
						Torstrasse 164
						<br />
						10115 Berlin
						<br />
						Phone +49 30 / 300 131 3-0
						<br />
						Fax +49 30 / 300 131 3-588
					</span>
					<p>{localizer({ key: "examples.about.contact.locations.berlin" })}</p>
				</div>
			</div>
			<div className={addPrefix("-u-flex -u-margin-t-md")}>
				<img src={hamburgImage} alt="hamburg office" style={{ width: "150px", height: "150px" }} />
				<div className={addPrefix("-u-margin-l-md")}>
					<span>
						<strong>Hamburg</strong>
						<br />
						mgm technology partners gmbh
						<br />
						Hollaendischer Brook 2<br />
						20457 Hamburg
						<br />
						Phone +49 40 / 808 128 20-0
						<br />
						Fax +49 40 / 808 128 20-388
					</span>
					<p>{localizer({ key: "examples.about.contact.locations.hamburg" })}</p>
				</div>
			</div>
		</ActionContentbox>
	);
}
