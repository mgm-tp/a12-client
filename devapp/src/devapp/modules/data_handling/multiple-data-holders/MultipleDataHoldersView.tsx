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

import { useDispatch, useSelector } from "react-redux";

import type { Activity, ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import {
	BulletList,
	Button,
	ActionContentbox,
	ContentBoxElements,
	Tile,
	Icon,
	type LayoutGridProps,
	LayoutGrid,
	ProgressIndicator
} from "@com.mgmtp.a12.widgets/widgets-core";

import { addTodo, moveTodo, removeTodo } from "./actions.js";
import type { TodoData } from "./TodoData.js";
import { isTodoDataHolder } from "./TodoData.js";

const SIZE = { sm: 12, md: 6, lg: 4 } as LayoutGridProps.ColumnSize;
const SIZE_MD = { sm: 12, md: 12, lg: 4 } as LayoutGridProps.ColumnSize;

export function MultipleDataHoldersView({ activityId, ariaLevel }: ViewNGProps) {
	const dispatch = useDispatch();

	const dataHolders =
		useSelector(ActivitySelectors.activityPropById(activityId, a => a.dataHolders)) ?? [];

	const dhListA = dataHolders.find(dh => isTodoDataHolder(dh) && dh.descriptor.listId === "A") as
		Activity.DataHolder<TodoData> | undefined;
	const dhListB = dataHolders.find(dh => isTodoDataHolder(dh) && dh.descriptor.listId === "B") as
		Activity.DataHolder<TodoData> | undefined;

	const todosA = dhListA?.data?.todos ?? [];
	const todosB = dhListB?.data?.todos ?? [];

	const busyA = dhListA?.busy;
	const busyB = dhListB?.busy;

	const dirty = dhListA?.dirty || dhListB?.dirty;
	const busy = busyA || busyB;

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="A data holder for each tile" ariaLevel={ariaLevel} />
			}
			buttons={[
				{
					align: "left",
					button: (
						<Button
							key="1"
							label="Reload List A"
							onClick={() =>
								dispatch(
									ActivityActions.loadData({
										activityId,
										dataHolderDescriptors: [
											{
												feature: "MultipleDataHolders",
												listId: "A"
											}
										]
									})
								)
							}
							disabled={busyA}
						/>
					)
				},
				{
					align: "left",
					button: (
						<Button
							key="2"
							label="Reload List B"
							onClick={() =>
								dispatch(
									ActivityActions.loadData({
										activityId,
										dataHolderDescriptors: [
											{
												feature: "MultipleDataHolders",
												listId: "B"
											}
										]
									})
								)
							}
							disabled={busyB}
						/>
					)
				},
				{
					align: "right",
					button: (
						<Button
							key="3"
							label="Reload All"
							onClick={() =>
								dispatch(
									ActivityActions.loadData({
										activityId
									})
								)
							}
							disabled={busy}
						/>
					)
				},
				{
					align: "right",
					button: (
						<Button
							key="4"
							primary
							label="Save All"
							onClick={() =>
								dispatch(
									ActivityActions.save.started({
										activityId,
										dataHolderDescriptors: [
											{
												feature: "MultipleDataHolders",
												listId: "A"
											},
											{
												feature: "MultipleDataHolders",
												listId: "B"
											}
										]
									})
								)
							}
							disabled={!dirty || busy}
						/>
					)
				}
			]}
		>
			<LayoutGrid.Grid fitToParent cellBorder>
				<LayoutGrid.Row fitToContent>
					<LayoutGrid.Column size={SIZE_MD}>
						<Tile title="Description" icon="info" ariaLevel={2}>
							<p>
								This example demonstrates the use of data reducers, data providers and multiple data
								holders within a single activity. This view is driven by one activity which has
								three different data holders:
							</p>
							<ul>
								<li>
									the activity data holder with loadingState &quot;without&quot; (not really used
									here),
								</li>
								<li>one data holder for List &quot;A&quot; </li>
								<li>and one data holder for List &quot;B&quot;.</li>
							</ul>
							<p>Data reducers are registered for each todo action:</p>
							<ul>
								<li>adding a new todo, which is triggered by clicking the button below the list</li>
								<li>
									removing an existing todo, which is triggered by clicking the trash icon next to
									it
								</li>
								<li>
									moving an existing todo to the other list, which is triggered by clicking the
									arrow icon
								</li>
								<li>saving all todo data</li>
							</ul>
							<p>There are three data providers registered for this example:</p>
							<ul>
								<li>one data provider loading todos for data holder &quot;A&quot;,</li>
								<li>one data provider loading todos for data holder &quot;B&quot;</li>
								<li>and another one for saving data for both data holders in one transaction.</li>
							</ul>
							<p>
								All network requests are stubbed, but using some delay to have a proper simulation.
							</p>
						</Tile>
					</LayoutGrid.Column>
					<LayoutGrid.Column size={SIZE}>
						<Tile title="Data Holder List A" icon="list" color="maroon" ariaLevel={2}>
							<BulletList.Ordered>
								{todosA.map(todo => (
									<BulletList.Item key={todo.id}>
										{todo.name}
										<Button
											title="Remove todo from List A"
											icon={<Icon>delete</Icon>}
											onClick={() =>
												dispatch(
													removeTodo({
														removedTodoId: todo.id,
														activityId,
														listId: "A"
													})
												)
											}
										></Button>
										<Button
											title="Move todo to List B"
											icon={<Icon>swap_horiz</Icon>}
											onClick={() =>
												dispatch(
													moveTodo({
														movedTodo: todo,
														activityId,
														listId: "A"
													})
												)
											}
										></Button>
									</BulletList.Item>
								))}
							</BulletList.Ordered>
							<Button
								label="Add todo to List A"
								onClick={() =>
									dispatch(addTodo({ newTodo: "New todo for A", activityId, listId: "A" }))
								}
							></Button>
							{busyA && <ProgressIndicator />}
						</Tile>
					</LayoutGrid.Column>
					<LayoutGrid.Column size={SIZE}>
						<Tile title="Data Holder List B" icon="list" color="peru" ariaLevel={2}>
							<BulletList.Ordered>
								{todosB.map(todo => (
									<BulletList.Item key={todo.id}>
										{todo.name}
										<Button
											title="Remove todo from List B"
											icon={<Icon>delete</Icon>}
											onClick={() =>
												dispatch(
													removeTodo({
														removedTodoId: todo.id,
														activityId,
														listId: "B"
													})
												)
											}
										></Button>
										<Button
											title="Move todo to List A"
											icon={<Icon>swap_horiz</Icon>}
											onClick={() =>
												dispatch(
													moveTodo({
														movedTodo: todo,
														activityId,
														listId: "B"
													})
												)
											}
										></Button>
									</BulletList.Item>
								))}
							</BulletList.Ordered>
							<Button
								label="Add todo to List B"
								onClick={() =>
									dispatch(addTodo({ newTodo: "New todo for B", activityId, listId: "B" }))
								}
							></Button>
							{busyB && <ProgressIndicator />}
						</Tile>
					</LayoutGrid.Column>
				</LayoutGrid.Row>
			</LayoutGrid.Grid>
		</ActionContentbox>
	);
}
