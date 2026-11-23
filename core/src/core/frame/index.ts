// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
