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
import { useDispatch, useSelector } from "react-redux";
import {
	terminateHostAction,
	terminateHostReset,
} from "@/lib/slices/ShadownetSlices";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Agent = ({ id }) => {

	const dispatch = useDispatch();
	const naviagte = useNavigate();

	const terminateSlice = useSelector((response) => response.TerminateHost);
	const { termID, isLoading, error } = terminateSlice;

	const handleTerminate = () => {
		dispatch(terminateHostAction({ id: id }));
	};

	useEffect(() => {
		if (termID) {
			toast.success(`Termination Initiated`, {
				description: `Host: ${termID}`,
			});
			// dispatch(terminateHostReset());
			naviagte("/dashboard");
		} else if (error) {
			toast.error(`Unable to terminate`, {
				description: error,
			});
			dispatch(terminateHostReset());
		}
	}, [termID, error]);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex w-full gap-8 flex-col bg-muted/30 lg:p-4 rounded-xl">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Shadownet Agent</h3>
					<h6 className="text-sm text-muted-foreground">
						ShadowNet agent information
					</h6>
				</div>
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Connected To</h3>
					<code className="text-sm text-muted-foreground">{id}</code>
				</div>
			</div>
			<div className="bg-muted/30 p-4 rounded-xl flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Terminate</h3>
					<h6 className="text-sm text-muted-foreground">
						Terminate the ShadowNet agent running on the host system.
					</h6>
				</div>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button className="w-40 bg-red-200 text-black">Terminate</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Terminate Agent?</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to terminate the ShadowNet agent? <br />
								It will re-run on next system reboot.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleTerminate}>
								Terminate
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
};

export default Agent;
