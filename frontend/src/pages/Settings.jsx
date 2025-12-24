import Container from "@/components/Container";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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
import LoadingSpinner from "@/components/LoadingSpinner";
import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { changePassword, changePasswordReset, updateProfile, updateProfileReset } from "@/lib/slices/AccountSlices";
import Navbar from "@/components/Navbar";


const Settings = () => {

    const dispatch = useDispatch()

	const { user } = useSelector((response) => response.AuthUser);
	const {
		success: updateProfileSuccess,
		isLoading: updateProfileLoading,
		error: updateProfileError,
	} = useSelector((response) => response.UpdateProfile);

	const {
		success: passwordUpdateSuccess,
		isLoading: passwordUpdateLoading,
		error: passwordUpdateError,
	} = useSelector((response) => response.ChangePassword);

	const [view, setView] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [emailAddress, setEmailAddress] = useState("");

	const updatePassword = () => {
		if (!oldPassword || !newPassword || !confirmPassword) {
			toast.error("Please fill in all the required details");
			return;
		}

		if (newPassword.trim() === confirmPassword.trim()) {
			dispatch(
				changePassword({
					oldPassword: oldPassword,
					confirmPassword: confirmPassword,
				})
			);
		} else {
			toast.error(`Confirm passoword does not match!`);
		}
	};

	const updateUserDetails = (id) => {
		if (!firstName || !lastName) {
			toast.error("Please fill all the required fields");
			return;
		}

		dispatch(
			updateProfile({
				id: id,
				firstname: firstName,
				lastname: lastName,
			})
		);
	};

	useEffect(() => {
		if (user) {
			setFirstName(user.first_name);
			setLastName(user.last_name);
			setEmailAddress(user.email);
		}
	}, [user]);

    useEffect(() => {
        if (updateProfileSuccess) {
            toast.success("Profile updated successfully!")
            dispatch(updateProfileReset())
        }
        
        if(passwordUpdateSuccess) {
            toast.success("Profile updated successfully!")
            dispatch(changePasswordReset())
        }
        
        if(updateProfileError){
            toast.error(updateProfileError)
            dispatch(updateProfileReset())
        }
        
        if(passwordUpdateError) {
            toast.error(passwordUpdateError)
            dispatch(changePasswordReset())
        }
    },[updateProfileSuccess, passwordUpdateSuccess, updateProfileError, passwordUpdateError])



  return (
    <main>
            <Navbar/>
        <Container className="mt-8">
            <div className="flex flex-col gap-2 overflow-scroll scrollbar-hide">
                    <div className="bg-muted/50 rounded-xl flex gap-2 p-5 w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="w-full flex justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-semibold">Settings</h3>
                                    <span className="text-xs text-muted-foreground">
                                        Manage your account settings.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section className="w-full flex flex-col gap-4 items-start justify-center dark:bg-[#141414] bg-muted rounded-2xl px-4 py-6">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-lg font-semibold">Personal Details</h4>
                            <span className="text-xs text-muted-foreground">
                                Change/update your personal detatils.
                            </span>
                        </div>
                        <div className="w-full">
                            <hr />
                        </div>
                        <div className="flex flex-col items-end md:gap-4 gap-8 w-full">
                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">First Name</h4>
                                    <span className="text-xs text-muted-foreground">
                                        Enter your first name.
                                    </span>
                                </div>
                                <Input
                                    placeholder="First Name"
                                    type="text"
                                    className="w-full md:w-100"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">Last Name</h4>
                                    <span className="text-xs text-muted-foreground">
                                        Enter your last name.
                                    </span>
                                </div>
                                <Input
                                    placeholder="Last Name"
                                    type="text"
                                    className="w-full md:w-100"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">Email Address</h4>
                                    <span className="text-xs text-muted-foreground">
                                        Your registered email address.
                                    </span>
                                </div>
                                <Input
                                    placeholder="Email"
                                    type="text"
                                    className="w-full md:w-100"
                                    value={emailAddress}
                                    disabled
                                />
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="md:w-50 w-full font-semibold mt-4">
                                        Save
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently update
                                            the details on our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => updateUserDetails(user && user.id)}
                                        >
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </section>

                    <section className="w-full flex flex-col gap-4 items-start justify-center dark:bg-[#141414] bg-muted rounded-2xl px-4 py-6">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-lg font-semibold">Change Password</h4>
                            <span className="text-xs text-muted-foreground">
                                You can change your password for security reasons.
                            </span>
                        </div>
                        <div className="w-full">
                            <hr />
                        </div>
                        <div className="flex flex-col items-end md:gap-4 gap-8 w-full">
                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">Old Password</h4>
                                    <span className="text-xs text-muted-foreground">
                                        Enter your old password.
                                    </span>
                                </div>
                                <Input
                                    placeholder="Old Password"
                                    type="password"
                                    className="w-full md:w-100"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">New Password</h4>
                                    <span className="text-xs text-muted-foreground">
                                        An alphanumeric password which is atleast 8 characters long.
                                    </span>
                                </div>
                                <Input
                                    placeholder="New Password"
                                    type="password"
                                    className="w-full md:w-100"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between md:items-center md:gap-20 gap-2 w-full md:flex-row flex-col">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold">Confirm New Password</h4>
                                    <span className="text-xs text-muted-foreground">
                                        Retype your password
                                    </span>
                                </div>
                                <div className="relative flex items-center">
                                    <Input
                                        placeholder="Confirm New Password"
                                        type={view ? "text" : "password"}
                                        className="w-full md:w-100"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        className="text-muted-foreground hover:text-foreground absolute right-5"
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => setView(!view)}
                                    >
                                        {view ? <EyeOpenIcon /> : <EyeNoneIcon />}
                                    </Button>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="md:w-50 w-full font-semibold mt-4">
                                        Save
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently update
                                            the details on our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={updatePassword}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </section>
                </div>
        </Container>
    </main>
  );
};

export default Settings;
