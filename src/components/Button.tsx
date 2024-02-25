import { IconName } from '@/const/IconName';
// icons
import { FaBell } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { LuBox } from 'react-icons/lu';
import { MdOutlineViewInAr } from 'react-icons/md';
import { MdOutlineExitToApp } from 'react-icons/md';

const iconStyles: Record<IconName, string> = {
	[IconName.Emer]: 'bg-red text-white',
	[IconName.Bell]: 'bg-red text-white',
	[IconName.Cancel]: 'bg-dark_grey text-white',
	[IconName.Obj]: 'bg-blue text-white',
	[IconName.NoObj]: 'bg-white border-2 border-dark_grey text-dark_grey',
	[IconName.Login]: 'bg-blue text-white',
	[IconName.Logout]: 'bg-dark_grey text-white',
};

const iconComponents: Record<IconName, JSX.Element> = {
	[IconName.Emer]: <p className="font-istok text-h3">Emergency</p>,
	[IconName.Bell]: <FaBell style={{ width: 58, height: 58 }} />,
	[IconName.Cancel]: <FaXmark style={{ width: 58, height: 58 }} />,
	[IconName.Obj]: <MdOutlineViewInAr style={{ width: 58, height: 58 }} />,
	[IconName.NoObj]: <LuBox style={{ width: 58, height: 58 }} />,
	[IconName.Login]: <p className="font-istok text-h4">Login</p>,
	[IconName.Logout]: <MdOutlineExitToApp style={{ width: 58, height: 58 }} />,
};

export default function Button({
	iconName,
	onClick,
}: {
	iconName: IconName;
	onClick: () => void;
}) {
	return (
		<button
			className={`px-48 py-16 rounded-md h-full w-full flex items-center justify-center ${iconStyles[iconName]}`}
			onClick={onClick}
		>
			{iconComponents[iconName]}
		</button>
	);
}
