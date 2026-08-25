import { type FunctionComponent } from 'preact';

type HideGapsButtonProps = {
    hideGaps: boolean;
    setHideGaps: (hideGaps: boolean) => void;
};

export const HideGapsButton: FunctionComponent<HideGapsButtonProps> = ({ hideGaps, setHideGaps }) => (
    <button
        className='btn btn-xs w-24'
        onClick={() => setHideGaps(!hideGaps)}
        title={
            hideGaps
                ? 'Date ranges that do not contain data are excluded from the table'
                : 'Exclude date ranges without data from the table'
        }
    >
        {hideGaps ? 'Gaps hidden' : 'Hide gaps'}
    </button>
);
