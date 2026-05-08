import { Container } from "@com.mgmtp.a12.client/client-core/lib/core/configuration";
import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main";

Container.config
	.bind(Container.identifier.Locales)
	.toConstantValue([Locale.fromString("L1"), Locale.fromString("L2")]);
