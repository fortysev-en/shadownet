/** @format */

import { CopyXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
	startSocketTasksAction,
	stopSocketTasksAction,
	terminateProcessAction,
} from "@/lib/slices/ShadownetSlices";
import { useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

const System = ({ id, socketState, socketStream, setSocketStream }) => {
	const dispatch = useDispatch();
	const [search, setSearch] = useState("");

	const [system, setSystem] = useState(null);
	const [memory, setMemory] = useState(null);
	const [network, setNetwork] = useState(null);
	const [processes, setProcesses] = useState(null);
	const [disk, setDisk] = useState(null);
	const [geo, setGeo] = useState(null);

	const [terminateProcessID, setTerminateProcessID] = useState(null);

	const customIcon = new Icon({
		iconUrl:
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDYtOCAxMi04IDEycy04LTYtOC0xMmE4IDggMCAwIDEgMTYgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
		iconSize: [22, 22],
	});

	const handleTerminate = () => {
		dispatch(terminateProcessAction({ id: id, command: terminateProcessID }));
	};

	const filteredList =
		processes &&
		processes.filter(
			(item) =>
				item.pid.toString().includes(search) ||
				item.name.toLowerCase().includes(search.toLowerCase())
		);

	useEffect(() => {
		if (socketStream) {
			setSystem(socketStream.system);
			setMemory(socketStream.memory);
			setNetwork(socketStream.network);
			setProcesses(socketStream.processes);
			setDisk(socketStream.disk);
			setGeo(socketStream.geo);
			setSocketStream(null);
		}
	}, [socketStream]);

	useEffect(() => {
		if (socketState) {
			dispatch(startSocketTasksAction({ id: id, task: "start_sysvitals" }));
		}

		return () => {
			setSocketStream(null);
			dispatch(stopSocketTasksAction({ id: id, task: "stop_sysvitals" }));
		};
	}, [socketState]);

	return (
		<div className="flex flex-col lg:flex-row flex-wrap w-full gap-2">
			{system && system ? (
				<div className="flex flex-1 lg:min-w-[800px] w-full gap-8 flex-col bg-muted/30 lg:p-4 rounded-xl">
					<div className="flex flex-col gap-1">
						<h3 className=" font-semibold">System</h3>
						<h6 className="text-sm text-muted-foreground">
							Basic information related to system & hardware
						</h6>
					</div>
					<div className="w-full flex flex-col gap-2">
						{Object.entries(system).map(([k, v], id) => (
							<div className="flex gap-28 justify-between w-full" key={id}>
								<h4 className="text-sm uppercase">{k}</h4>
								<code className="text-sm">{v}</code>
							</div>
						))}
					</div>
				</div>
			) : (
				<Skeleton className="flex flex-1 lg:min-w-[800px] w-full gap-8 flex-col bg-muted/30 p-4 rounded-xl h-80" />
			)}

			{memory && memory ? (
				<div className="flex flex-1 lg:min-w-[800px] w-full gap-8 flex-col bg-muted/30 p-4 rounded-xl">
					<div className="flex flex-col gap-1">
						<h3 className=" font-semibold">Memory</h3>
						<h6 className="text-sm text-muted-foreground">
							Information about RAM
						</h6>
					</div>
					<div className="w-full flex flex-col gap-2">
						{Object.entries(memory).map(([k, v], id) => (
							<div className="flex gap-28 justify-between w-full" key={id}>
								<h4 className="text-sm uppercase">{k}</h4>
								<code className="text-sm">{v}</code>
							</div>
						))}
					</div>
				</div>
			) : (
				<Skeleton className="flex flex-1 lg:min-w-[800px] w-full gap-8 flex-col bg-muted/30 p-4 rounded-xl h-80" />
			)}

			{filteredList && filteredList ? (
				<div className="flex flex-1 flex-grow w-full lg:min-w-[800px] gap-8 flex-col bg-muted/30 p-4 rounded-xl">
					<div className="w-full flex items-center justify-between">
						<div className="flex flex-col gap-1">
							<h3 className=" font-semibold">Processes</h3>
							<h6 className="text-sm text-muted-foreground">
								Current running processes
							</h6>
						</div>
						<Input
							placeholder="Search by PROCESS or PID"
							className="w-1/2 border-none placeholder:text-center"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<div className="flex items-end justify-end flex-col gap-1">
							<h3 className=" font-semibold">
								{filteredList && filteredList.length}
							</h3>
							<h6 className="text-sm text-muted-foreground">
								Updates every 5 seconds
							</h6>
						</div>
					</div>
					<div className="flex items-center w-full pr-5 px-2">
						<div className="w-full lg:w-2/3 flex items-center gap-4">
							<h3 className="text-sm font-semibold w-1/4">PID</h3>
							<h3 className="text-sm font-semibold w-2/4">PROCESS</h3>
							<h3 className="text-sm font-semibold w-1/4">MEMORY</h3>
						</div>
						<div className="w-full lg:w-1/3 flex items-end justify-end">
							<h3 className="text-sm text-end font-semibold">ACTION</h3>
						</div>
					</div>
					<div className="react-json-viewer h-80 w-full flex flex-col gap-2 pr-5 overflow-scroll scrollbar-hide">
						{filteredList &&
							filteredList.map((proc, id) => (
								<div
									className="flex justify-between py-2 hover:bg-muted-foreground/10 px-2 rounded"
									key={id}
								>
									<div className="w-full lg:w-2/3 flex items-center gap-4">
										{Object.entries(proc).map(([k, v], idm) =>
											idm === 1 ? (
												<code className="text-sm w-2/4" key={idm}>
													{v}
												</code>
											) : (
												<code className="text-sm w-1/4" key={idm}>
													{v}
												</code>
											)
										)}
									</div>
									<div className="w-1/3">
										<h1 className="text-sm flex items-end justify-end">
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<CopyXIcon
														size={18}
														className="cursor-pointer"
														onClick={() => setTerminateProcessID(proc.pid)}
													/>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Terminate Process?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to terminate{" "}
															<span className="font-semibold">
																{terminateProcessID}
															</span>
															?
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel
															onClick={() => setTerminateProcessID(null)}
														>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction onClick={handleTerminate}>
															Terminate
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</h1>
									</div>
								</div>
							))}
					</div>
				</div>
			) : (
				<Skeleton className="flex flex-1 flex-grow w-full lg:min-w-[800px] gap-8 flex-col bg-muted/30 p-4 rounded-xl h-80" />
			)}

			{disk && disk ? (
				<div className="flex flex-1 flex-grow lg:min-w-[600px] gap-8 flex-col bg-muted/30 p-4 rounded-xl">
					<div className="flex flex-col gap-1">
						<h3 className=" font-semibold">Disk</h3>
						<h6 className="text-sm text-muted-foreground">
							Available disk partitions
						</h6>
					</div>
					<div className="w-full flex flex-col gap-2">
						{disk.map((disk, id) => (
							<div
								className="w-full flex flex-col gap-1 p-2 border rounded"
								key={id}
							>
								<div className="flex items-center justify-between w-full">
									<h4 className="text-sm font-semibold">{disk.device}</h4>
									<h4 className="text-sm font-semibold">{disk.fstype}</h4>
								</div>
								<div className="w-full bg-muted-foreground/10 rounded-md">
									<div
										className={cn(
											"h-3 opacity-80 rounded",
											disk.percent <= 80
												? "bg-[#6ee7b7]"
												: "bg-[#f87171]"
										)}
										style={{
											width: `${disk.percent}%`,
										}}
									></div>
								</div>
								<div className="flex items-center justify-between w-full text-muted-foreground">
									<h4 className="text-sm">
										<span className="font-semibold">{disk.free}</span> free of{" "}
										{disk.used}
									</h4>
									<h4 className="text-sm font-semibold">{disk.total}</h4>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<Skeleton className="flex flex-1 flex-grow lg:min-w-[600px] gap-8 flex-col bg-muted/30 p-4 rounded-xl h-80" />
			)}

			{geo && geo ? (
				<div className="flex w-full gap-8 flex-col bg-muted/30 p-4 rounded-xl">
					<div className="flex flex-col gap-1">
						<h3 className=" font-semibold">Geolocation</h3>
						<h6 className="text-sm text-muted-foreground">
							Geolocation information
						</h6>
					</div>
					<div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
						<div className="relative w-full lg:w-1/2 h-80 overflow-hidden rounded-xl">
							<MapContainer center={[geo.latitude, geo.longitude]} zoom={12}>
								<TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
								<Marker
									position={[geo.latitude, geo.longitude]}
									icon={customIcon}
								></Marker>
							</MapContainer>
						</div>
						<div className="w-full lg:w-1/2 flex flex-col gap-2 h-60 pr-5 overflow-scroll scrollbar-hide">
							<div className="w-full flex flex-col gap-2">
								{Object.entries(geo).map(([k, v], id) => (
									<div className="flex justify-between" key={id}>
										<h4 className="text-sm uppercase">{k}</h4>
										<code className="text-sm">{v}</code>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			) : (
				<Skeleton className="flex w-full gap-8 flex-col bg-muted/30 p-4 rounded-xl h-80" />
			)}
		</div>
	);
};

export default System;
