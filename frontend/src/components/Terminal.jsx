/** @format */

"use client";

import Console from "@/components/Console";
import { useEffect, useRef } from "react";

const Terminal = ({ id, socketState, socketStream, setSocketStream }) => {
	const scrollRef = useRef(null);

	useEffect(() => {
		const container = scrollRef.current;
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}, [socketStream]);

	return (
		<div className="w-full flex flex-col gap-2 min-h-[60vh]">
			<div className="bg-muted/30 lg:p-4 rounded-xl flex items-center justify-between w-full">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Terminal</h3>
					<h6 className="text-sm text-muted-foreground">
						Start writing commands directly on the terminal
					</h6>
					<h6 className="text-sm text-muted-foreground">
						Note: Changing tabs will loose all the captured data
					</h6>
				</div>
			</div>

			<div className="w-full min-h-[60vh] bg-muted/30 rounded-xl flex items-center justify-center">
				<div
					ref={scrollRef}
					className="w-full min-h-[60vh] bg-muted/30 flex flex-col overflow-scroll rounded-xl p-5"
				>
					<Console
						id={id}
						socketState={socketState}
						socketStream={socketStream}
						setSocketStream={setSocketStream}
					/>
				</div>
			</div>
		</div>
	);
};

export default Terminal;