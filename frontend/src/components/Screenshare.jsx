/** @format */

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
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
	startSocketTasksAction,
	stopSocketTasksAction,
} from "@/lib/slices/ShadownetSlices";
import { VideoOffIcon } from "lucide-react";

const Screenshare = ({ id, socketState, socketStream, setSocketStream }) => {
	const dispatch = useDispatch();
	const [btnState, setBtnState] = useState(false);

	const handleStartScreenshare = () => {
		if (socketState) {
			dispatch(startSocketTasksAction({ id: id, task: "start_screenshare" }));
			setBtnState(true);
		}
	};

	const handleStopScreenshare = () => {
		setSocketStream(null);
		dispatch(stopSocketTasksAction({ id: id, task: "stop_screenshare" }));
		setBtnState(false);
	};

	useEffect(() => {
		return () => {
			if (btnState) {
				setSocketStream(null);
				dispatch(stopSocketTasksAction({ id: id, task: "stop_screenshare" }));
				setBtnState(false);
			}
		};
	}, [btnState]);

	return (
		<div className="w-full flex flex-col gap-2 min-h-[60vh]">
			<div className="bg-muted dark:bg-[#141414] p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-start justify-between w-full">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Start Stream</h3>
					<h6 className="text-sm text-muted-foreground">
						Click on start to access the live video steam
					</h6>
					<h6 className="text-sm text-muted-foreground">
						Note: Changing tabs will stop the screenshare
					</h6>
				</div>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						{btnState ? (
							<Button variant="destructive" className="w-40">
								Stop Streaming
							</Button>
						) : (
							<Button className="w-full lg:w-40">Start Streaming</Button>
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
								onClick={
									btnState ? handleStopScreenshare : handleStartScreenshare
								}
							>
								{btnState ? "Stop" : "Start"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
			<div className="w-full flex gap-5 h-full">
				<div className="w-full h-[60vh] bg-muted/30 rounded-xl flex items-center justify-center">
					{socketStream && btnState ? (
						<div className="h-full">
							<img
								src={`data:image/png;base64,${socketStream}`}
								alt="stream"
								className="rounded-xl"
							/>
						</div>
					) : (
						<VideoOffIcon size={80} strokeWidth={1.2} className="opacity-60" />
					)}
				</div>
			</div>
		</div>
	);
};

export default Screenshare;
