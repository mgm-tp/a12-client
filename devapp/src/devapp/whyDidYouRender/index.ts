// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { setupWhyDidYouRender } from "@com.mgmtp.a12.devtools/why-did-you-render";

const redux = await import("react-redux");

await setupWhyDidYouRender([[redux, "useSelector"]]);
