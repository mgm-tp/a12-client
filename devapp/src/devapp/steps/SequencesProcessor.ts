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

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import { sleep } from "../utils/sleep.js";

import { ActionProcessor } from "./ActionProcessor.js";
import type { ActionSequence } from "./ActionSequence.js";
import type { StateHistory, StateHistoryEntry } from "./factories.js";

const logger = LoggerFactory.getLogger("extensions/steps");

/**
 * Class to execute a collection of step action sequences
 */
export class SequencesProcessor {
	private actionProcessor: ActionProcessor;
	public readonly actionSequences: ReadonlyArray<ActionSequence>;
	private readonly store: Store<object>;
	private readonly stateHistory: StateHistory;
	public readonly onDescriptionChange: (currentStepDescription: string) => void;
	public readonly onSequenceChange: (currentSequenceDescription: string) => void;

	constructor(
		actionSequences: ReadonlyArray<ActionSequence>,
		store: Store<object>,
		stateHistory: StateHistory,
		onDescriptionChange: (currentStepDescription: string) => void,
		onSequenceChange: (currentSequenceDescription: string) => void
	) {
		this.actionSequences = actionSequences;
		this.store = store;
		this.stateHistory = stateHistory;
		this.onDescriptionChange = onDescriptionChange;
		this.onSequenceChange = onSequenceChange;
		this.actionProcessor = new ActionProcessor(store);
	}

	async runSequence(sequenceNumber: number, delay: number): Promise<void> {
		if (sequenceNumber >= this.actionSequences.length) {
			logger.error(`Sequence number ${sequenceNumber} is out of range!`);
			return;
		}

		const sequence = this.actionSequences[sequenceNumber];
		this.onSequenceChange(sequence.name);
		logger.info(">>> START SEQUENCE", sequence.name);

		for (let i = 0; i < sequence.steps.length; i++) {
			const nextStepResult = await this.nextStep(sequence, i);

			const step = sequence.steps[i];

			logger.info(step.description);
			step.test?.(
				nextStepResult.state,
				sequence.name + " - " + step.description,
				nextStepResult.stateDiff
			);

			// Optional sleep to see result after step was executed
			await sleep(delay);
		}

		this.onDescriptionChange("Success");
		logger.info("<<< END SEQUENCE", sequence.name);

		return Promise.resolve();
	}

	async runAllSequences(delay: number): Promise<void> {
		for (let i = 0; i < this.actionSequences.length; i++) {
			await this.runSequence(i, delay);
		}

		return Promise.resolve();
	}

	public async nextStep(sequence: ActionSequence, stepIdx: number): Promise<NextStepResult> {
		const step = sequence.steps[stepIdx];
		const stepDescription = `${step.description} (${stepIdx + 1}/${sequence.steps.length})`;

		logger.info(stepDescription);

		this.onDescriptionChange(stepDescription);

		const stateBeforeStep = this.stateHistory.lastEntry();
		await this.actionProcessor.executeStep(step);

		return {
			state: this.store.getState(),
			stateDiff: stateBeforeStep
				? this.stateHistory.entriesAfter(stateBeforeStep)
				: this.stateHistory.entries
		};
	}
}

interface NextStepResult {
	readonly state: object;
	readonly stateDiff: StateHistoryEntry[];
}
