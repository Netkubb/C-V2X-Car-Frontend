import { ReactNode } from 'react';

export default function TextContentBox({
	title,
	content,
	helperText,
	warning
}: {
	title: string;
	content: string;
	helperText?: string;
	warning?: boolean;
}): ReactNode {
	return (
		<div className={`h-full w-full flex flex-col ${warning ? "bg-yellow-300" : "bg-white"} rounded-md items-center p-8 font-istok text-black`}>
			{warning ?
				<p className="text-p3 flex items-center h-[30%]"><b>Warning:</b>&nbsp;Overspeed!</p>
				: <p className="text-p3 flex items-center h-[30%]">{title}</p>
			}
			<p className="text-h1 flex items-center h-full">{content}</p>
			{helperText &&
				(<p className="text-p3 flex items-center h-[30%]">{helperText}</p>)
			}
		</div>
	);
}
