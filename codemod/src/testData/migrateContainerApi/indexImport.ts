import { Container } from "@com.mgmtp.a12.client/client-core/lib/core/configuration";

import { localesX } from "./locales.js";

Container.config.bind(Container.identifier.Locales).toConstantValue(localesX);
