// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { createRequire } from "node:module";

import { setupWhyDidYouRenderForTest } from "@com.mgmtp.a12.devtools/why-did-you-render";

// top level await is not possible here, because mocha itself "require"s this file
const redux = createRequire(import.meta.url)("react-redux");

setupWhyDidYouRenderForTest([[redux, "useSelector"]]);
