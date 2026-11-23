// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { sleep } from "../utils/sleep.js";

import { ActionProcessor } from "./ActionProcessor.js";
import type { ActionSequence } from "./ActionSequence.js";
import type { StateHistory } from "./factories.js";

const logger = LoggerFactory.getLogger("extensions/steps");

/**
 * Class to execute a collection of step action sequences
 */
export class SequencesProcessor {
	private actionProcessor: ActionProcessor;

	constructor(
		public readonly actionSequences: ReadonlyArray<ActionSequence>,
		private readonly store: Store<object>,
		private readonly stateHistory: StateHistory,
		public readonly onDescriptionChange: (currentStepDescription: string) => void,
		public readonly onSequenceChange: (currentSequenceDescription: string) => void
	) {
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
	readonly stateDiff: StateHistory.Entry[];
}
