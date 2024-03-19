import { FunctionComponent } from 'preact';

export interface InfoProps {
    content: string;
    className?: string;
}

const Info: FunctionComponent<InfoProps> = ({ content, className }) => {
    return (
        <div class={`${className} tooltip`} data-tip={content}>
            <button class='btn btn-xs'>?</button>
        </div>
    );
};

export default Info;
