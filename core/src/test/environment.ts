// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import "global-jsdom/register";
import { install } from "source-map-support";

// default behavior is "auto", which would detect a browser (due to JSDOM)
install({ environment: "node" });

// Due to newer version of react-resize-detector using native ResizeObserver that is not available in jsdom
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
window.ResizeObserver = global.ResizeObserver;

// this function, which is not implemented by JsDom, is called by form engine
window.Element.prototype.scrollIntoView = () => {};

// prevent jsdom being detected as touch device
delete global.window.ontouchstart;

(global as any).IS_REACT_ACT_ENVIRONMENT = true;
