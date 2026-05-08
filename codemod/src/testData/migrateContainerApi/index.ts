import { Container } from "@com.mgmtp.a12.client/client-core/lib/core/configuration";

Container.config.bind(Container.identifier.LoggingStrategy).toConstantValue("A");

Container.config
	.rebind(Container.identifier.LoggingStrategy)
	.toConstantValue(new ConsoleLoggingStrategy(console, LogLevel.ERROR));

Container.config.bind(Container.identifier.Locales).toConstantValue(["L1", "L2"]);

Container.config.unbind(Container.identifier.LoggingStrategy);
Container.config.unbind(Container.identifier.Locales);
