// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import CommitErrorModule from "./commitError/index.js";
import ErrorBoundariesModule from "./errorBoundaries/index.js";
import GeneralErrorHandlingModule from "./errorHandling/index.js";

const ErrorHandlingModules = [CommitErrorModule, GeneralErrorHandlingModule, ErrorBoundariesModule];

export default ErrorHandlingModules;
