import type { TestRunnerConfig } from '@storybook/test-runner';
import { visualizationStories } from '../tests/visualizationStories';

const config: TestRunnerConfig = {
    async postVisit(_, context) {
        if (!context.id.startsWith('visualization-')) {
            return;
        }

        if (!visualizationStories.map((story) => story.id).includes(context.id)) {
            throw Error(
                `Story ${JSON.stringify(context.id)} is not included in visualizationStories. ` +
                    'Please add its id to the list to execute snapshot tests for this story.',
            );
        }
    },
};

export default config;
