// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import type { ActionSequence } from "./ActionSequence.js";
import type { StateHistory } from "./factories.js";
import { SequencesProcessor } from "./SequencesProcessor.js";
import { stepTestActionSequences } from "./stepTestActionSequences.js";

interface CustomWindow extends Window {
	steps: ConsoleSteps;
}

declare const window: CustomWindow;

const logger = LoggerFactory.getLogger("extensions/steps");

interface ConsoleSteps {
	runAll(pauseTimeInSeconds: number): void;
	readonly [key: string]:
		| { run(pauseTimeInSeconds: number): void }
		| ((pauseTimeInSeconds: number) => void);
}

export function setupSteps(store: Store<object>, stateHistory: StateHistory): void {
	const sequencesProcessor = new SequencesProcessor(
		stepTestActionSequences,
		store,
		stateHistory,
		currentStepDescription => {
			handleStepDescriptionChange(currentStepDescription);
		},
		currentSequenceDescription => {
			handleSequenceDescriptionChange(currentSequenceDescription);
		}
	);

	function runSteps(sequenceNumber: number, pauseTimeInSeconds = 0) {
		sequencesProcessor.runSequence(sequenceNumber, pauseTimeInSeconds * 1000).catch(error => {
			processReject(error);
		});
	}

	function runAllSteps(pauseTimeInSeconds = 0) {
		sequencesProcessor.runAllSequences(pauseTimeInSeconds * 1000).catch(error => {
			processReject(error);
		});
	}

	const initialSteps: ConsoleSteps = {
		runAll: (pauseTimeInSeconds = 0) => {
			runAllSteps(pauseTimeInSeconds);
		}
	};

	const steps: ConsoleSteps = stepTestActionSequences.reduce(
		(obj: ConsoleSteps, sequence: ActionSequence, index: number) => ({
			...obj,
			[sequence.name]: {
				run: (pauseTimeInSeconds = 0) => {
					runSteps(index, pauseTimeInSeconds);
				}
			}
		}),
		initialSteps
	);

	window.steps = steps;
}

/* oxlint-disable no-console */
function handleStepDescriptionChange(value: string) {
	const style = value === "Success" ? "color: green;" : "";
	console.log(`%c ${value}`, style);

	if (value === "Success") {
		console.groupEnd();
	}
}

function handleSequenceDescriptionChange(value: string) {
	console.group(value);
}

function processReject(error: Error): void {
	logger.error(error);

	console.groupEnd();

	if (error) {
		alert("Error! Check console for more information");
	}
}
