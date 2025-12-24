/** @format */

import { useLayoutEffect, useState } from "react";
import "./global.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import ReduxProvider from "@/lib/ReduxProvider";
import { Toaster } from "sonner";
import AuthWrapper from "./components/AuthWrapper";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "./components/ui/theme-provider";
import Host from "./pages/Host";
import Settings from "./pages/Settings";

function App() {
	const Wrapper = ({ children }) => {
		const location = useLocation();
		useLayoutEffect(() => {
			document.documentElement.scrollTo(0, 0);
		}, [location.pathname]);

		return children;
	};

	return (
		<main className="w-full flex justify-center">
			<div className="relative w-full">
				<ReduxProvider>
					<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
						<BrowserRouter>
							<Wrapper>
								<Routes>
									{/* Public Route */}
									<Route path="/" element={<Login />} />

									<Route element={<AuthWrapper />}>
										<Route path="/dashboard" element={<Dashboard />} />
										<Route path="/settings" element={<Settings />} />
										<Route path="/connect/host" element={<Host />} />
									</Route>
								</Routes>
							</Wrapper>
						</BrowserRouter>
						<Toaster duration={4000} richColors />
					</ThemeProvider>
				</ReduxProvider>
			</div>
		</main>
	);
}

export default App;
