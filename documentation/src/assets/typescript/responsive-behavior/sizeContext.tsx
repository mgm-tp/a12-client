// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { useWindowSize } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.view.js";

function MyApplication(): JSX.Element {
	return <div>My Application</div>;
}

// tag::register-size-context[]
export function ResizableApplication(): JSX.Element {
	const { breakPoint } = useWindowSize();

	return (
		<SizeContext.Provider value={{ currentSize: breakPoint.size }}>
			<MyApplication />
		</SizeContext.Provider>
	);
}
// end::register-size-context[]
