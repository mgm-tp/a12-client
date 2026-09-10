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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { ok, partialDeepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act, type ReactNode } from "react";
import type { Action } from "redux";

import { query } from "@com.mgmtp.a12.devtools/react";
import { DataRoles } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/data-roles.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { ToastGroupProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.api.js";
import { ToastGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.view.js";
import type { ToastProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast/toast.api.js";

import { assertNotNullish } from "../../../../core/assertion.js";
import type { ClientWidgetMap } from "../../../../core/ClientWidgetMap.js";
import type { Notification } from "../../../../core/notification/index.js";
import { NotificationActions, NotificationViews } from "../../../../core/notification/index.js";
import { createStoreForTest, type MockStore } from "../../../unit/core/frame/utils.js";
import { KEY_OUTPUT_LOCALIZER_CONTEXT, US_LOCALE } from "../../../utils/localization.js";
import { render, screen, within, type RenderResult } from "../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

describe("core.notification.views", () => {
	const isRemoveNotificationAction = (id: string) => (action: Action) =>
		NotificationActions.remove.match(action) && action.payload[0] === id;

	function hasRemoveAction(store: MockStore, id: string): boolean {
		return store.getActions().some(isRemoveNotificationAction(id));
	}

	const NotificationComponentMock: React.ComponentType<{ notification: Notification }> = () => (
		<noscript />
	);

	const ChildrenMock = () => <div data-testid="children-mock" />;

	describe("Frame", () => {
		describe("small device (only render latest toast)", () => {
			it("renders its children", async () => {
				const store = createStoreForTest({ initialState: { locale: US_LOCALE } });
				const children = <ChildrenMock />;
				await setup({ store, children, smallDevice: true });

				screen.getByDataTestId("children-mock");
			});

			it("passes notifications to the toast widget", async () => {
				const notification1: Notification = {
					id: "1",
					message: { key: "myMessage" },
					position: "bottom-left",
					severity: "error",
					title: { key: "myTitle" }
				};

				const notification2: Notification = {
					id: "2",
					message: { key: "myMessage" },
					duration: 4711,
					position: "top-left",
					severity: "info",
					title: undefined
				};

				const store = createStoreForTest({
					initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
				});

				const { widgetSpys } = await setup({ store, smallDevice: true });
				const toastElements = query(widgetSpys.Toast).propsHistory();

				strictEqual(toastElements.length, 1);
				partialDeepStrictEqual(toastElements[0], {
					type: "temporary",
					header: "",
					message: "myMessage",
					variant: "info"
				});
			});

			describe("Given a notification", () => {
				it("triggers a remove action if onClose is triggered", async () => {
					const notification: Notification = {
						id: "1",
						message: { key: "myMessage" }
					};
					const store = createStoreForTest({
						initialState: { locale: US_LOCALE, notifications: [notification] }
					});
					const { widgetSpys } = await setup({ store, smallDevice: true });
					ok(
						!hasRemoveAction(store, notification.id),
						"Expected no remove action before triggering onClose"
					);

					await act(() => query(widgetSpys.Toast).props().onClose?.());
					ok(hasRemoveAction(store, notification.id));
				});

				it("triggers a remove action if the duration is temporary", async () => {
					const notification1: Notification = {
						id: "1",
						message: { key: "myMessage" }
					};
					const notification2: Notification = {
						id: "2",
						message: { key: "myMessage" },
						duration: 4711
					};

					const store = createStoreForTest({
						initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
					});

					const { widgetSpys } = await setup({ store, smallDevice: true });
					const props = query(widgetSpys.Toast).props();
					strictEqual(props.duration, 4711);
					strictEqual(props.type, "temporary");
				});
			});

			it("calls the notification renderer if the property view is given in the notification", async () => {
				const notification1: Notification = {
					id: "1",
					message: { key: "myMessage" },
					componentId: "myComponentId"
				};

				const notification2: Notification = {
					id: "2",
					message: { key: "myMessage" },
					componentId: "myComponentId"
				};

				const componentSpy = mock.fn(NotificationComponentMock);
				const notificationRenderer = mock.fn(() => componentSpy);

				const store = createStoreForTest({
					initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
				});

				await setup({
					store,
					props: { notificationRenderer },
					smallDevice: true
				});

				const element = query(componentSpy).props();
				partialDeepStrictEqual(element.notification, notification2);
				ok(notificationRenderer.mock.callCount() > 0);
			});
		});

		describe("others", () => {
			it("renders its children", async () => {
				const children = <ChildrenMock />;
				const store = createStoreForTest({ initialState: { locale: US_LOCALE } });
				await setup({ store, children });

				screen.getByDataTestId("children-mock");
			});

			it("passes notifications to the toast widget", async () => {
				const notification1: Notification = {
					id: "1",
					message: { key: "toast1Message" },
					position: "bottom-left",
					severity: "error",
					title: { key: "myTitle" }
				};

				const notification2: Notification = {
					id: "2",
					message: { key: "toast2Message" },
					duration: 4711,
					position: "top-left",
					severity: "info",
					title: undefined
				};

				const store = createStoreForTest({
					initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
				});
				const { widgetSpys } = await setup({ store });

				assertToastInGroup("bottom-left", {
					type: "permanent",
					header: "myTitle",
					message: "toast1Message",
					variant: "error"
				});

				assertToastInGroup("top-left", {
					type: "temporary",
					message: "toast2Message",
					variant: "info",
					duration: 4711
				});

				function assertToastInGroup(
					position: Notification["position"],
					props: ToastProps & { message: string }
				): void {
					const toastGroupBottomLeft = screen.getByDataTestId(`toast-group-${position}`);
					const toastElement1 = toastInGroup(toastGroupBottomLeft);
					const toast1Message = toastMessage(toastElement1);
					strictEqual(toast1Message.textContent, props.message);

					const toast1Props = toastPropsByMessage(props.message, widgetSpys.Toast);
					partialDeepStrictEqual(toast1Props, props);
				}
				function toastInGroup(group: HTMLElement): HTMLElement {
					return within(group).getByTestId(DataRoles.Toast);
				}
				function toastMessage(toast: HTMLElement): HTMLElement {
					return within(toast).getByTestId(DataRoles.Toast.Message);
				}
				function toastPropsByMessage(
					message: string,
					spy: React.ComponentType<ToastProps>
				): ToastProps {
					return assertNotNullish(
						query(spy)
							.propsHistory()
							.find(p => p.message === message)
					);
				}
			});

			describe("Given a notification", () => {
				it("triggers a remove action if onClose is triggered", async () => {
					const notification: Notification = {
						id: "1",
						message: { key: "myMessage" }
					};

					const store = createStoreForTest({
						initialState: { locale: US_LOCALE, notifications: [notification] }
					});
					const { widgetSpys } = await setup({ store });
					ok(
						!hasRemoveAction(store, notification.id),
						"Expected no remove action before triggering onClose"
					);

					await act(() => query(widgetSpys.Toast).props().onClose?.());
					ok(hasRemoveAction(store, notification.id));
				});

				it("triggers a remove action if the duration is temporary", async () => {
					const notification1: Notification = {
						id: "1",
						message: { key: "myMessage" }
					};

					const notification2: Notification = {
						id: "2",
						message: { key: "myMessage" },
						duration: 4711
					};

					const store = createStoreForTest({
						initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
					});
					const { widgetSpys } = await setup({ store });
					const props = query(widgetSpys.Toast).props();
					strictEqual(props.duration, 4711);
					strictEqual(props.type, "temporary");
				});
			});

			it("calls the notification renderer if the property view is given in the notification", async () => {
				const notification1: Notification = {
					id: "1",
					message: { key: "myMessage" },
					componentId: "myComponentId"
				};

				const notification2: Notification = {
					id: "2",
					message: { key: "myMessage" }
				};

				const component: React.ComponentType<{ notification: Notification }> = mock.fn(() => (
					<noscript />
				));
				const notificationRenderer = mock.fn(() => component);

				const store = createStoreForTest({
					initialState: { locale: US_LOCALE, notifications: [notification1, notification2] }
				});
				await setup({
					store,
					props: { notificationRenderer }
				});
				const element = query(component).props();
				partialDeepStrictEqual(element.notification, notification1);
				ok(notificationRenderer.mock.callCount() > 0);
			});
		});

		interface SetupArgs {
			store: MockStore;
			props?: NotificationViews.Frame.PropsType;
			children?: ReactNode;
			smallDevice?: boolean;
		}
		interface SetupResult {
			result: RenderResult;
			widgetSpys: Pick<ClientWidgetMap, "Toast" | "ToastGroup">;
		}
		async function setup(options: SetupArgs): Promise<SetupResult> {
			const ToastGroupSpy = mock.fn(ToastGroup);
			const ToastGroupPositionMarker: React.ComponentType<ToastGroupProps> = props => (
				<ToastGroupSpy {...props}>
					<div data-testid={`toast-group-${props.position}`}>{props.children}</div>
				</ToastGroupSpy>
			);

			// never actually call widget, because it will call onClose itself, when a
			// duration is set
			const ToastMock: React.ComponentType<ToastProps> = props => (
				<div data-role={DataRoles.Toast}>
					<div data-role={DataRoles.Toast.Message}>{props.message}</div>
				</div>
			);

			const widgetSpys = {
				Toast: mock.fn(ToastMock),
				ToastGroup: mock.fn(ToastGroupPositionMarker)
			} satisfies Partial<ClientWidgetMap>;

			const result = await act(() =>
				render(
					<TestWrapper
						customWidgetMap={widgetSpys}
						store={options.store}
						localizerContextValue={KEY_OUTPUT_LOCALIZER_CONTEXT}
					>
						<SizeContext.Provider value={{ currentSize: options.smallDevice ? "sm" : undefined }}>
							<NotificationViews.Frame {...options.props}>
								{options.children}
							</NotificationViews.Frame>
						</SizeContext.Provider>
					</TestWrapper>
				)
			);

			return {
				result,
				widgetSpys
			};
		}
	});
});
