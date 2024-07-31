import { type FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';

export interface InfoProps {}

const Info: FunctionComponent<InfoProps> = ({ children }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const toggleHelp = () => {
        dialogRef.current?.showModal();
    };

    return (
        <div className='relative'>
            <button type='button' className='btn btn-xs' onClick={toggleHelp}>
                ?
            </button>
            <dialog ref={dialogRef} className={'modal modal-bottom sm:modal-middle'}>
                <div className='modal-box sm:max-w-5xl'>
                    <form method='dialog'>
                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                    </form>
                    <div className={'flex flex-col'}>{children}</div>
                    <div className='modal-action'>
                        <form method='dialog'>
                            <button className={'float-right underline text-sm hover:text-blue-700 mr-2'}>Close</button>
                        </form>
                    </div>
                </div>
                <form method='dialog' className='modal-backdrop'>
                    <button>Helper to close when clicked outside</button>
                </form>
            </dialog>
        </div>
    );
};

export const InfoHeadline1: FunctionComponent = ({ children }) => {
    return <h1 className='text-lg font-bold'>{children}</h1>;
};

export const InfoHeadline2: FunctionComponent = ({ children }) => {
    return <h2 className='text-base font-bold mt-4'>{children}</h2>;
};

export const InfoParagraph: FunctionComponent = ({ children }) => {
    return <p className='text-justify my-1'>{children}</p>;
};

export const InfoLink: FunctionComponent<{ href: string }> = ({ children, href }) => {
    return (
        <a className='text-blue-600 hover:text-blue-800' href={href} target='_blank' rel='noopener noreferrer'>
            {children}
        </a>
    );
};

export type InfoComponentCodeProps = {
    componentName: string;
    params: object;
    lapisUrl: string;
};

export const InfoComponentCode: FunctionComponent<InfoComponentCodeProps> = ({ componentName, params, lapisUrl }) => {
    const componentCode = componentParametersToCode(componentName, params, lapisUrl);
    const codePenData = {
        title: 'GenSpectrum dashboard component',
        html: generateFullExampleCode(componentCode, componentName),
        layout: 'left',
        editors: '100',
    };
    return (
        <>
            <InfoHeadline2>Use this component yourself</InfoHeadline2>
            <InfoParagraph>
                This component was created using the following parameters:
                <div className='p-4 border border-gray-200 rounded-lg overflow-x-auto'>
                    <pre>
                        <code>{componentCode}</code>
                    </pre>
                </div>
            </InfoParagraph>
            <InfoParagraph>
                You can add this component to your own website using the{' '}
                <InfoLink href='https://github.com/GenSpectrum/dashboard-components'>
                    GenSpectrum dashboard components library
                </InfoLink>{' '}
                and the code from above.
            </InfoParagraph>
            <InfoParagraph>
                <form action='https://codepen.io/pen/define' method='POST' target='_blank'>
                    <input
                        type='hidden'
                        name='data'
                        value={JSON.stringify(codePenData).replace(/"/g, '&quot;').replace(/'/g, '&apos;')}
                    />

                    <button className='text-blue-600 hover:text-blue-800' type='submit'>
                        Click here to try it out on CodePen.
                    </button>
                </form>
            </InfoParagraph>
        </>
    );
};

export default Info;

function componentParametersToCode(componentName: string, params: object, lapisUrl: string) {
    const stringifyIfNeeded = (value: unknown) => {
        return typeof value === 'object' ? JSON.stringify(value) : value;
    };

    const attributes = indentLines(
        Object.entries(params)
            .map(([key, value]) => `${key}='${stringifyIfNeeded(value)}'`)
            .join('\n'),
        4,
    );
    return `<gs-app lapis="${lapisUrl}">\n  <gs-${componentName}\n${attributes}\n  />\n</gs-app>`;
}

function generateFullExampleCode(componentCode: string, componentName: string) {
    const storyBookPath = `/docs/visualization-${componentName}--docs`;
    return `<html>
<head>
  <script type="module" src="https://unpkg.com/@genspectrum/dashboard-components@latest/standalone-bundle/dashboard-components.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/@genspectrum/dashboard-components@latest/dist/style.css" />
</head>

<body>
  <!-- Component documentation: https://genspectrum.github.io/dashboard-components/?path=${storyBookPath} -->
${indentLines(componentCode, 2)}
</body>
</html>
`;
}

function indentLines(text: string, numberSpaces: number) {
    const spaces = ' '.repeat(numberSpaces);
    return text
        .split('\n')
        .map((line) => spaces + line)
        .join('\n');
}
