/** @format */
import {
	startSocketTasksAction,
	// stopSocketTasksAction,
} from "@/lib/slices/ShadownetSlices";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const Console = ({ id: idx, socketState, socketStream, setSocketStream }) => {
	const dispatch = useDispatch();

	const [val, setVal] = useState("");
	const [responses, setResponses] = useState([]);

	const handleFocus = () => {
		let ref = document.getElementById("inputTerminal");
		ref.focus();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			let res = val.trim();
			if (res === "clear" || res === "cls") {
				setResponses([]);
				setVal("");
			} else if (res !== "") {
				dispatch(
					startSocketTasksAction({
						id: idx,
						task: "start_console",
						command: val,
					})
				);
			}
		}
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			document.addEventListener("keydown", handleFocus);
		}
		return () => {
			document.removeEventListener("keydown", handleFocus);
			// dispatch(stopSocketTasksAction({ id: idx, task: "stop_console" }));
		};
	}, []);

	useEffect(() => {
		if (socketStream) {
			setResponses((prev) => [
				...prev,
				{
					query: val,
					response: socketStream
						.replace(/\n/g, "<br />")
						.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"),
				},
			]);
			setVal("");
			handleFocus();
			setSocketStream("");
		}
	}, [socketStream]);

	return (
		<div className="w-full h-[60vh] flex flex-col gap-1">
			{responses &&
				responses.map((resp, id) => (
					<div key={id} className="flex flex-col gap-1 w-full">
						<div className="flex gap-2 w-full">
							<code className="text-sm text-[#4aa77c] font-semibold">
								root@{idx}:~$
							</code>
							<code className="text-sm">{resp.query}</code>
						</div>
						<code
							className="text-sm text-muted-foreground"
							dangerouslySetInnerHTML={{ __html: resp.response }}
						></code>
					</div>
				))}

			<div className="flex gap-2 relative">
				<code className="text-sm text-[#4aa77c] font-semibold">
					root@{idx}:~$
				</code>
				<input
					id="inputTerminal"
					type="text"
					spellCheck={false}
					autoComplete="off"
					onKeyDown={handleKeyDown}
					value={val}
					onChange={(e) => setVal(e.target.value)}
					className="bg-transparent absolute outline-none focus:outline-none text-sm text-transparent"
				/>
				<code className="text-sm">{val}</code>
				<span className="w-2 h-5 mb-0.5 bg-foreground animate-blink -ml-2 -z-10"></span>
			</div>
		</div>
	);
};

export default Console;
