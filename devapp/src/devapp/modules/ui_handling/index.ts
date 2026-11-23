// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module } from "@com.mgmtp.a12.client/client-core";

import ApplicationFrameLayoutModule from "./application-frame-layout/index.js";
import CaseConceptModule from "./case-concept.js";
import CustomRegionModule from "./customRegion/custom-region.js";
import DashboardLayoutModule from "./dashboard-layout/index.js";
import EntityLinkingModule from "./entity-linking.js";
import MasterDetailModule from "./master-detail.js";
import MobileNavigationCustomModule from "./mobile-navigation/custom/index.js";
import MobileNavigationModule from "./mobile-navigation/index.js";
import ModalRegionModule from "./modal-region.js";
import NotificationsModule from "./notifications/index.js";
import { PermissionModule } from "./permissions/index.js";
import ViewsConceptModule from "./viewsConcept/index.js";

const UIHandlingModules: Module[] = [
	ViewsConceptModule,
	MasterDetailModule,
	DashboardLayoutModule,
	ModalRegionModule,
	CustomRegionModule,
	NotificationsModule,
	CaseConceptModule,
	EntityLinkingModule,
	MobileNavigationModule,
	MobileNavigationCustomModule,
	ApplicationFrameLayoutModule,
	PermissionModule
];

export default UIHandlingModules;
