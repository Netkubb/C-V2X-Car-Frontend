export default function Modal({
	isOpen,
	header,
	content,
}: {
	isOpen: boolean;
	header: string;
	content: string;
}) {
	return (
		<>
			{isOpen && (
				<div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
					<div className="z-20 flex flex-col ">
						<div className="w-full bg-red px-32 py-8 rounded-t-lg shadow-lg">
							<p className="font-istok text-white text-h4 words-break">
								{header}
							</p>
						</div>
						<div className="w-full bg-white px-32 py-16 rounded-b-lg shadow-lg">
							<p className="font-istok text-black text-p1 words-break">
								{content}
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
