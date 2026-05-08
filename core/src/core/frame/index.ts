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

/**
 * This package contains the infrastructure to create the "frame" UI, i.e. the UI of everything outside of the
 * views (see view package).
 *
 * Note that the default implementation provides a setup that uses Plasma Application Frame Layout and
 * related components.
 *
 * @packageDocumentation
 */
export { LOCALE_SELECT_RESOURCE_KEYS, LocaleSelect } from "./internal/components/LocaleSelect.js";
export { FrameFactories } from "./internal/factories.js";
export { RESOURCE_KEYS as FRAME_RESOURCE_KEYS } from "./internal/languages/index.js";
export { FrameViews } from "./internal/views.js";

export type {
	LayoutNG,
	LayoutPropsNG,
	RegionReferenceNG,
	RegionUiPropsNG
} from "./internal/layoutNG/layoutPropsNG.js";

export { DynamicRegionUi } from "./internal/layoutNG/DynamicRegionUi.js";

export { ModalRegionUiNG, type ModalRegionUiNGProps } from "./internal/layoutNG/ModalRegionUiNG.js";

export { DynamicGenericCaseMenu } from "./internal/layout/ApplicationFrameLayout/generic-component.js";

export {
	ApplicationFrameLayoutNG,
	ApplicationFrameLayoutNGComponent
} from "./internal/layoutNG/builtins/ApplicationFrame.js";
export type { ApplicationFrameLayoutPropsNG } from "./internal/layoutNG/builtins/ApplicationFrame.js";
export { DashboardLayoutComponentNG } from "./internal/layoutNG/builtins/Dashboard.js";
export { MasterDetailRegionLayoutNG } from "./internal/layoutNG/builtins/MasterDetail.js";
export type { MasterDetailLayoutPropsNG } from "./internal/layoutNG/builtins/MasterDetail.js";
export { NullRegionLayoutNG } from "./internal/layoutNG/builtins/NullRegion.js";
export { StackRegionLayoutNG } from "./internal/layoutNG/builtins/StackRegion.js";

export { LayoutProvidersContext } from "./internal/layout/LayoutProvidersContext.js";
