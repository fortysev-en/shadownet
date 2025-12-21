/** @format */

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { refreshToken, verifyToken } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { authUser } from "@/lib/slices/AccountSlices";

const AuthWrapper = () => {
  
	const dispatch = useDispatch();
	const [isAuthenticated, setIsAuthenticated] = useState(null);
	const { user, error } = useSelector((state) => state.AuthUser);

	useEffect(() => {
		const clearAuthAndRedirect = () => {
			localStorage.removeItem("access");
			setIsAuthenticated(false);
		};

		const checkAuth = async () => {
			const access = localStorage.getItem("access");

			if (!access) {
				const newAccess = await refreshToken();
				if (newAccess) {
					setIsAuthenticated(true);
					if (!user) dispatch(authUser());
				} else {
					clearAuthAndRedirect();
				}
				return;
			}

			try {
				const isAccessValid = await verifyToken(access);

				if (isAccessValid) {
					setIsAuthenticated(true);
					if (!user) dispatch(authUser());
					return;
				}

				const newAccess = await refreshToken();

				if (newAccess) {
					setIsAuthenticated(true);
					if (!user) dispatch(authUser());
				} else {
					clearAuthAndRedirect();
				}
			} catch {
				clearAuthAndRedirect();
			}
		};

		checkAuth();
	}, [dispatch, user]);

	useEffect(() => {
		if (error) {
			localStorage.removeItem("access");
			setIsAuthenticated(false);
		}
	}, [error]);

	if (isAuthenticated === null) return null;
	if (!isAuthenticated) return <Navigate to="/" replace />;
	if (!user) return null;

	return <Outlet />;
};

export default AuthWrapper;
