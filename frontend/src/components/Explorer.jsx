/** @format */

import {
	deleteFileAction,
	deleteFileReset,
	startSocketTasksAction,
} from "@/lib/slices/ShadownetSlices";
import {
	ArrowLeftIcon,
	DownloadIcon,
	FileIcon,
	FolderIcon,
	HardDriveIcon,
	HomeIcon,
	SearchIcon,
	Trash2Icon,
	UploadIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CHUNK_SIZE = 1024;
const MAX_FILE_SIZE_MB = 25;

const Explorer = ({ id, socketState, socketStream, setSocketStream }) => {

	const dispatch = useDispatch();
	const [streamData, setStreamData] = useState(null);
	const explorerSocketRef = useRef(null);

	const [totalChunks, setTotalChunks] = useState(0);
	const [receivedChunks, setReceivedChunks] = useState(0);

	const [uploadSuccess, setUploadSuccess] = useState(false);

	const [search, setSearch] = useState("");

	const [fileData, setFileData] = useState(
		"data:application/octet-stream;base64,"
	);
	const [fileName, setFileName] = useState("");
	const [highlight, setHighlight] = useState(null);
	const [downloadReady, setDownloadReady] = useState(false);

	const { success, error } = useSelector((response) => response.DeleteFile);

	const handleDownloadFile = (file) => {
		setFileName(file);
		dispatch(
			startSocketTasksAction({
				id: id,
				task: "upload_file",
				command: streamData.path + "\\" + file,
			})
		);
	};

	const filteredList =
		streamData &&
		streamData.content &&
		streamData.content.filter((item) =>
			item.name.toLowerCase().includes(search.toLowerCase())
		);

	useEffect(() => {
		if (typeof window !== "undefined") {
			if (fileName && downloadReady) {
				const link = document.createElement("a");
				link.href = fileData;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				setFileData("data:application/octet-stream;base64,");
				setFileName("");
				setReceivedChunks(0);
				setTotalChunks(0);
				setDownloadReady(false);
				toast.success(`${fileName} downloaded successfully!`);
			}
		}
	}, [fileName, downloadReady]);

	useEffect(() => {
		if (socketStream) {
			setStreamData(socketStream);
			setSocketStream(null);
		}
	}, [socketStream]);

	useEffect(() => {
		explorerSocketRef.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/shadownet/connect/client/explorer/`);
		explorerSocketRef.current.onopen = () => {
			console.log("2 WebSocket connected");
		};

		explorerSocketRef.current.onmessage = (event) => {
			const json_parsed = JSON.parse(event.data);
			if (json_parsed.data.payload === "EOF") {
				setDownloadReady(true);
			} else {
				setFileData((prevData) => prevData + json_parsed.data.payload);
				setReceivedChunks((prev) => prev + 1);
				setTotalChunks(json_parsed.data.total_chunks);
			}
		};

		explorerSocketRef.current.onclose = () => {
			console.log("2 WebSocket disconnected");
		};

		return () => {
			if (explorerSocketRef.current) {
				explorerSocketRef.current.close();
			}
		};
	}, []);

	const splitPath = (path) => {
		const driveMatch = path.match(/^[a-zA-Z]:\\/);
		const drive = driveMatch[0];
		const restOfPath = path.slice(drive.length);
		const pathParts = restOfPath.split("\\");
		return [drive, ...pathParts];
	};

	const handleFolderNav = (curr, dir) => {
		dispatch(
			startSocketTasksAction({
				id: id,
				task: "explorer",
				command: curr + "\\" + dir,
			})
		);
	};

	const handleRoot = () => {
		dispatch(
			startSocketTasksAction({
				id: id,
				task: "explorer",
			})
		);
	};

	const handleDriveNav = (drive) => {
		dispatch(
			startSocketTasksAction({
				id: id,
				task: "explorer",
				command: drive,
			})
		);
	};

	const handleDeleteFile = (filename) => {
		dispatch(
			deleteFileAction({ id: id, command: streamData.path + "\\" + filename })
		);
		toast.success(`${filename} deleted!`);
	};

	useEffect(() => {
		if (success || uploadSuccess) {
			dispatch(
				startSocketTasksAction({
					id: id,
					task: "explorer",
					command: streamData.path,
				})
			);
			dispatch(deleteFileReset());
			setUploadSuccess(false);
		}
	}, [success, uploadSuccess]);

	const handleUpload = () => {
		document.getElementById("selectFile").click();
	};

	const handleBack = () => {
		let d = splitPath(streamData.path);
		if (d[d.length - 1] === "") {
			handleRoot();
		} else {
			d.pop();
			dispatch(
				startSocketTasksAction({
					id: id,
					task: "explorer",
					command: d.join("\\"),
				})
			);
		}
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			document.addEventListener("click", () => {
				setHighlight(null);
			});
		}
		return () =>
			document.removeEventListener("click", () => {
				setHighlight(null);
			});
	}, []);

	useEffect(() => {
		if (socketState) {
			dispatch(startSocketTasksAction({ id: id, task: "explorer" }));
		}
		return () => {
			setSocketStream(null);
		};
	}, [socketState]);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const fileSizeMB = file.size / (1024 * 1024);
			if (fileSizeMB > MAX_FILE_SIZE_MB) {
				toast.error(`File size exceeds the 25MB limit!`, {
					description: `Your file is ${fileSizeMB.toFixed(2)}MB.`,
					classNames: { error: "bg-red-400" },
				});
				return;
			} else {
				const reader = new FileReader();
				reader.onload = (e) => {
					const base64String = e.target.result.split(",")[1];
					const totChunks = Math.ceil(base64String.length / CHUNK_SIZE);

					for (let i = 0; i < totChunks; i++) {
						const chunk = base64String.slice(
							i * CHUNK_SIZE,
							(i + 1) * CHUNK_SIZE
						);
						if (explorerSocketRef && explorerSocketRef.current) {
							explorerSocketRef.current.send(
								JSON.stringify({
									path: streamData.path,
									filename: file.name,
									payload: chunk,
								})
							);
						}
					}
					if (explorerSocketRef && explorerSocketRef.current) {
						explorerSocketRef.current.send(
							JSON.stringify({
								path: streamData.path,
								filename: file.name,
								payload: "EOF",
							})
						);
						toast.success(`${file.name} uploaded!`);
						setUploadSuccess(true);
					}
				};
				reader.readAsDataURL(file);
			}
		}
	};

	return (
		<div className="w-full flex flex-col gap-5 min-h-[60vh]">
			<div className="bg-muted/30 lg:p-4 rounded-xl flex items-center justify-between w-full">
				<div className="flex flex-col gap-1">
					<h3 className="text-md font-semibold">File Explorer</h3>
					<h6 className="text-sm text-muted-foreground">
						Explore, Upload and Download files from host
					</h6>
				</div>
			</div>
			<div className="bg-muted/30 p-4 rounded-xl w-full flex flex-col gap-4">
				<div className="flex items-center gap-1 pb-2 select-none flex-wrap">
					<div
						className={
							streamData && streamData.path
								? "flex items-center gap-2 py-1 px-3 rounded bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer"
								: "flex items-center gap-2 py-1 px-3 rounded bg-muted-foreground/5 pointer-events-none"
						}
						onClick={handleBack}
					>
						<ArrowLeftIcon size={16} className="mb-1" />
					</div>

					<div
						className={
							streamData && streamData.path
								? "flex items-center gap-3 py-1 px-3 rounded bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer"
								: "flex items-center gap-3 py-1 px-3 rounded bg-muted-foreground/5 pointer-events-none"
						}
						onClick={handleRoot}
					>
						<HomeIcon size={13} className="mb-1" />
						<span className="text-sm">HOME</span>
					</div>
					<div
						className={
							streamData && streamData.path
								? "flex items-center gap-3 py-1 px-3 rounded bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer"
								: "flex items-center gap-3 py-1 px-3 rounded bg-muted-foreground/5 pointer-events-none"
						}
						onClick={handleUpload}
					>
						<input
							id="selectFile"
							type="file"
							className="hidden"
							onChange={handleFileChange}
						/>
						<UploadIcon size={13} className="mb-1" />
						<span className="text-sm">UPLOAD</span>
					</div>
					<div className="flex items-center gap-1 bg-muted-foreground/10 w-full lg:flex-1 rounded">
						<div className="flex items-center gap-2 py-1 px-2 rounded">
							<FolderIcon size={15} className="mb-1" />
							<span className="text-sm">PATH</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="text-sm">{streamData && streamData.path}</span>
						</div>
					</div>
					<div className="relative flex items-center">
						<Input
							placeholder="Search"
							className="w-full lg:w-60 rounded bg-muted-foreground/10 border-none h-7 p-2"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<SearchIcon size={16} className="absolute right-3" />
					</div>
				</div>
				<div className="w-full h-[51vh] flex flex-col items-start gap-1 overflow-scroll scrollbar-hide pr-4">
					{filteredList ? (
						filteredList.map((item, id) =>
							item.type === "file" ? (
								item.name === fileName ? (
									<div
										className="relative flex items-center justify-between p-1 rounded w-full select-none cursor-default"
										key={id}
									>
										<div className="flex items-center gap-2 w-2/3 z-10">
											<FileIcon size={18} />
											<code className="text-sm max-w-[50%] truncate">
												{item.name}
											</code>
										</div>
										<code className="text-sm z-10">{item.size}</code>
										<div className="w-full h-full absolute bg-muted-foreground/30 rounded top-0 left-0 -z-10">
											<div
												className="w-1/4 h-full rounded bg-[#06d6a0] p-1"
												style={{
													width: totalChunks
														? `${(receivedChunks / totalChunks) * 100}%`
														: `${0}%`,
												}}
											/>
											<code className="text-sm z-10"></code>
										</div>
									</div>
								) : (
									<ContextMenu key={id}>
										<ContextMenuTrigger
											className={cn(
												"flex items-center justify-between p-1 rounded hover:bg-muted-foreground/30 w-full select-none cursor-default",
												highlight === id ? "bg-muted-foreground/30" : null
											)}
											onContextMenu={() => setHighlight(id)}
										>
											<div className="flex items-center gap-2 w-2/3">
												<FileIcon size={18} />
												<code className="text-sm max-w-[50%] truncate">
													{item.name}
												</code>
											</div>
											<code className="text-sm">{item.size}</code>
										</ContextMenuTrigger>
										<ContextMenuContent className="min-w-48">
											<ContextMenuItem
												disabled={totalChunks}
												onClick={() => handleDownloadFile(item.name)}
											>
												Download
												<ContextMenuShortcut>
													<DownloadIcon size={18} />
												</ContextMenuShortcut>
											</ContextMenuItem>
											<ContextMenuSeparator />
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<ContextMenuItem onSelect={(e) => e.preventDefault()}>
														Delete
														<ContextMenuShortcut>
															<Trash2Icon size={18} />
														</ContextMenuShortcut>
													</ContextMenuItem>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Are you sure?</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to DELETE{" "}
															<span className="font-semibold">{item.name}</span>
															?<br />
															This action is irreversible!
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteFile(item.name)}
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</ContextMenuContent>
									</ContextMenu>
								)
							) : (
								<div
									className="flex items-center justify-between p-1 rounded hover:bg-muted-foreground/30 w-full select-none cursor-pointer"
									onClick={
										item.type === "dir"
											? () => handleFolderNav(streamData.path, item.name)
											: () => handleDriveNav(item.name)
									}
									key={id}
								>
									<div className="flex items-center gap-2 w-2/3">
										{item.type === "dir" ? (
											<FolderIcon size={18} stroke="#00b4d8" fill="#00b4d8" />
										) : (
											<HardDriveIcon size={18} stroke="#e63946" />
										)}
										<code className="text-sm max-w-[50%] truncate">
											{item.name}
										</code>
									</div>
									<code className="text-sm">
										{item.type === "drive" ? item.size : null}
									</code>
								</div>
							)
						)
					) : (
						<Skeleton className="flex items-center justify-between p-1 h-6 rounded hover:bg-muted-foreground/30 w-full select-none cursor-pointer">
							<div className="flex items-center gap-2 w-2/3">
								<code className="text-sm max-w-[50%] truncate"></code>
							</div>
							<code className="text-sm"></code>
						</Skeleton>
					)}
				</div>
			</div>
		</div>
	);
};

export default Explorer;
