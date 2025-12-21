/** @format */

import { createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { BACKEND_API_URL, DEV_MODE } from '../utils';

export const GetDashboardSlice = createSlice({
	name: "GetDashboardSlice",
	initialState: {},
	reducers: {
		getDashboardStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		getDashboardSuccess(state, action) {
			state.dashboardData = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		getDashboardFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		getDashboardReset() {
			return {};
		},
	},
});

export const {
	getDashboardStart,
	getDashboardSuccess,
	getDashboardFailure,
	getDashboardReset,
} = GetDashboardSlice.actions;

export const getDashboardDataAction = () => async (dispatch) => {
	dispatch(getDashboardStart());
	try {
		const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/shadownet/get_dashboard_data/` : `/api/shadownet/get_dashboard_data/`;
		const response = await api.get(apiUrl);
		dispatch(getDashboardSuccess(response.data));
	} catch (error) {
		dispatch(getDashboardFailure(error.message));
	}
};

// =================================================================================================================
export const StartSocketTaskSlice = createSlice({
	name: "startSocketTaskSlice",
	initialState: {},
	reducers: {
		startSocketTaskStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		startSocketTaskSuccess(state) {
			state.success = true;
			state.isLoading = false;
			state.error = null;
		},
		startSocketTaskFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		startSocketTaskReset() {
			return {};
		},
	},
});

export const {
	startSocketTaskStart,
	startSocketTaskSuccess,
	startSocketTaskFailure,
	startSocketTaskReset,
} = StartSocketTaskSlice.actions;

export const startSocketTasksAction = (data) => async (dispatch) => {
	dispatch(startSocketTaskStart());
	try {
		const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/shadownet/start_socket_task/` : `/api/shadownet/start_socket_task/`;
		const response = await api.post(apiUrl, data);
		dispatch(startSocketTaskSuccess(response.data));
	} catch (error) {
		dispatch(startSocketTaskFailure(error.message));
	}
};

// =================================================================================================================
export const StopSocketTaskSlice = createSlice({
	name: "stopSocketTaskSlice",
	initialState: {},
	reducers: {
		stopSocketTaskStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		stopSocketTaskSuccess(state) {
			state.success = true;
			state.isLoading = false;
			state.error = null;
		},
		stopSocketTaskFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		stopSocketTaskReset() {
			return {};
		},
	},
});

export const {
	stopSocketTaskStart,
	stopSocketTaskSuccess,
	stopSocketTaskFailure,
	stopSocketTaskReset,
} = StopSocketTaskSlice.actions;

export const stopSocketTasksAction = (data) => async (dispatch) => {
	dispatch(stopSocketTaskStart());
	try {
		const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/shadownet/stop_socket_task/` : `/api/shadownet/stop_socket_task/`;
		const response = await api.post(apiUrl, data);
		dispatch(stopSocketTaskSuccess(response.data));
	} catch (error) {
		dispatch(stopSocketTaskFailure(error.message));
	}
};

// DELETE FILE
// =================================================================================================================
export const DeleteFileSlice = createSlice({
	name: "deleteFileSlice",
	initialState: {},
	reducers: {
		deleteFileStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		deleteFileSuccess(state) {
			state.success = true;
			state.isLoading = false;
			state.error = null;
		},
		deleteFileFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		deleteFileReset() {
			return {};
		},
	},
});

export const {
	deleteFileStart,
	deleteFileSuccess,
	deleteFileFailure,
	deleteFileReset,
} = DeleteFileSlice.actions;

export const deleteFileAction = (data) => async (dispatch) => {
	dispatch(deleteFileStart());
	try {		
		const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/shadownet/remove_file/` : `/api/shadownet/remove_file/`;
		const response = await api.post(apiUrl, data);
		dispatch(deleteFileSuccess(response.data));
	} catch (error) {
		dispatch(deleteFileFailure(error.message));
	}
};

// Terminate Process
// =================================================================================================================
export const TerminateProcessSlice = createSlice({
	name: "TerminateProcessSlice",
	initialState: {},
	reducers: {
		terminateProcessStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		terminateProcessSuccess(state) {
			state.success = true;
			state.isLoading = false;
			state.error = null;
		},
		terminateProcessFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		terminateProcessReset() {
			return {};
		},
	},
});

export const {
	terminateProcessStart,
	terminateProcessSuccess,
	terminateProcessFailure,
	terminateProcessReset,
} = TerminateProcessSlice.actions;

export const terminateProcessAction = (data) => async (dispatch) => {
	dispatch(terminateProcessStart());
	try {
		const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/shadownet/terminate_process/` : `/api/shadownet/terminate_process/`;
		const response = await api.post(apiUrl, data);
		dispatch(terminateProcessSuccess(response.data));
	} catch (error) {
		dispatch(terminateProcessFailure(error.message));
	}
};

// Terminate Host
// =================================================================================================================
export const TerminateHostSlice = createSlice({
	name: "TerminateHostSlice",
	initialState: {},
	reducers: {
		terminateHostStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		terminateHostSuccess(state, action) {
			state.termID = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		terminateHostFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		terminateHostReset() {
			return {};
		},
	},
});

export const {
	terminateHostStart,
	terminateHostSuccess,
	terminateHostFailure,
	terminateHostReset,
} = TerminateHostSlice.actions;

export const terminateHostAction = (data) => async (dispatch) => {
	dispatch(terminateHostStart());
	try {
		const apiUrl = DEV_MODE
			? `${BACKEND_API_URL}/api/shadownet/self_terminate/`
			: `/api/shadownet/self_terminate/`;
		const response = await api.post(apiUrl, data);
		dispatch(terminateHostSuccess(response.data));
	} catch (error) {
		dispatch(terminateHostFailure(error.message));
	}
};

// Post Agent Build
// =================================================================================================================
export const PostAgentBuildSlice = createSlice({
	name: "postAgentBuildSlice",
	initialState: {},
	reducers: {
		postAgentBuildStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		postAgentBuildSuccess(state) {
			state.success = true;
			state.isLoading = false;
			state.error = null;
		},
		postAgentBuildFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		postAgentBuildReset() {
			return {};
		},
	},
});

export const {
	postAgentBuildStart,
	postAgentBuildSuccess,
	postAgentBuildFailure,
	postAgentBuildReset,
} = PostAgentBuildSlice.actions;

export const postAgentBuildAction = (data) => async (dispatch) => {
	dispatch(postAgentBuildStart());
	try {
		const apiUrl = DEV_MODE
			? `${BACKEND_API_URL}/api/shadownet/post_agent_build/`
			: `/api/shadownet/post_agent_build/`;
		const response = await api.post(apiUrl, data);
		dispatch(postAgentBuildSuccess(response.data));
	} catch (error) {
		dispatch(postAgentBuildFailure(error.message));
	}
};

// GET AGENT LIST DATA
// =================================================================================================================
export const GetAgentListSlice = createSlice({
	name: "getAgentListSlice",
	initialState: {},
	reducers: {
		getAgentListStart(state) {
			state.isLoading = true;
			state.error = null;
		},
		getAgentListSuccess(state, action) {
			state.agentList = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		getAgentListFailure(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},
		getAgentListReset() {
			return {};
		},
	},
});

export const {
	getAgentListStart,
	getAgentListSuccess,
	getAgentListFailure,
	getAgentListReset,
} = GetAgentListSlice.actions;

export const getAgentListAction = () => async (dispatch) => {
	dispatch(getAgentListStart());
	try {
		const apiUrl = DEV_MODE
			? `${BACKEND_API_URL}/api/shadownet/get_agent_list/`
			: `/api/shadownet/get_agent_list/`;
		const response = await api.get(apiUrl);
		dispatch(getAgentListSuccess(response.data));
	} catch (error) {
		dispatch(getAgentListFailure(error.message));
	}
};