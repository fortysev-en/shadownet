import { configureStore } from '@reduxjs/toolkit'
import {
	AuthUserSlice,
	ChangePasswordSlice,
	LoginSlice,
	UpdateProfileSlice,
} from "@/lib/slices/AccountSlices";
import {
	GetDashboardSlice,
	StartSocketTaskSlice,
	StopSocketTaskSlice,
	DeleteFileSlice,
	TerminateProcessSlice,
	TerminateHostSlice,
	GetAgentListSlice,
	PostAgentBuildSlice,
} from "@/lib/slices/ShadownetSlices";

export const store = configureStore({
	reducer: {
		// ACCOUNT
		Login: LoginSlice.reducer,
		AuthUser: AuthUserSlice.reducer,
		ChangePassword: ChangePasswordSlice.reducer,
		UpdateProfile: UpdateProfileSlice.reducer,

		//SHADOWNET
		GetDashboard: GetDashboardSlice.reducer,
		StartSocketTask: StartSocketTaskSlice.reducer,
		StopSocketTask: StopSocketTaskSlice.reducer,
		DeleteFile: DeleteFileSlice.reducer,
		TerminateProcess: TerminateProcessSlice.reducer,
		TerminateHost: TerminateHostSlice.reducer,
		PostAgentBuild: PostAgentBuildSlice.reducer,
		GetAgentList: GetAgentListSlice.reducer,
	},
});
