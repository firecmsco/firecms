import { useSnackbarController } from "@firecms/core";
import { useEffect, useRef, useState } from "react";
import { ArrowBackIcon, Button, CircularProgress, IconButton, LoadingButton, TextField, Typography } from "@firecms/ui";
import { FireCMSBackend } from "../../types";

type LoginFormMode = "email" | "password" | "registration";

export function CloudUserPasswordForm({
                                          onClose,
                                          fireCMSBackend,
                                      }: {
    onClose: () => void,
    fireCMSBackend: FireCMSBackend,
}) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [loginState, setLoginState] = useState<LoginFormMode>("email"); // ["email", "password", "registration"]
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [previouslyUsedMethodsForUser, setPreviouslyUsedMethodsForUser] = useState<string[] | undefined>();
    const [resettingPassword, setResettingPassword] = useState(false);

    const snackbarController = useSnackbarController();

    useEffect(() => {
        if ((loginState === "password" || loginState === "registration") && passwordRef.current) {
            passwordRef.current.focus()
        }
    }, [loginState]);

    useEffect(() => {
        if (!document) return;
        const escFunction = (event: any) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [onClose]);

    function handleEnterEmail() {
        if (email) {
            fireCMSBackend.fetchSignInMethods(email).then((availableProviders) => {
                setPreviouslyUsedMethodsForUser(availableProviders.filter(p => p !== "password"));
            });
            setLoginState("password");
        }
    }

    function handleEnterPassword() {
        if (email && password) {
            fireCMSBackend.emailPasswordLogin(email, password);
        }
    }

    function handleRegistration() {
        if (email && password) {
            fireCMSBackend.createUserWithEmailAndPassword(email, password);
        }
    }

    const onBackPressed = () => {
        if (loginState === "email") {
            onClose();
        } else if (loginState === "password" || loginState === "registration") {
            setLoginState("email");
        } else {
            setPreviouslyUsedMethodsForUser(undefined);
        }
    }

    const handleSubmit = (event: any) => {
        console.log("handleSubmit", loginState);
        event.preventDefault();
        if (loginState === "email") {
            handleEnterEmail();
        } else if (loginState === "password") {
            handleEnterPassword();
        } else if (loginState === "registration") {
            handleRegistration();
        }
    }

    const label = loginState === "registration"
        ? "Please enter your email and password to create an account"
        : (loginState === "password" ? "Please enter your password" : "Please enter your email");

    return (
        <form
            className={"w-full"}
            onSubmit={handleSubmit}>

            <div className={"max-w-[480px] w-full flex flex-col gap-4"}>

                <div className={"w-full flex flex-row items-center gap-4"}>
                    <IconButton
                        size={"small"}
                        onClick={onBackPressed}>
                        <ArrowBackIcon size={"small"}/>
                    </IconButton>

                    <Typography
                        className={`${loginState === "registration" && "flex"}`}
                        variant={"label"}>{label}</Typography>
                </div>
                {(loginState === "email" || loginState === "registration") && <TextField placeholder="Email" autoFocus
                                                                                         value={email ?? ""}
                                                                                         disabled={fireCMSBackend.authLoading}
                                                                                         type="email"
                                                                                         size={"small"}
                                                                                         onChange={(event) => setEmail(event.target.value)}/>}

                <div
                    className={`${loginState === "password" || (loginState === "registration") ? "block" : "hidden"}`}>
                    <TextField placeholder="Password"
                               value={password ?? ""}
                               disabled={fireCMSBackend.authLoading}
                               inputRef={passwordRef}
                               size={"small"}
                               type="password"
                               onChange={(event) => setPassword(event.target.value)}/>
                </div>

                <div
                    className={`${loginState === "registration" ? "hidden" : "flex"} justify-end items-center w-full flex gap-2`}>

                    {fireCMSBackend.authLoading &&
                        <CircularProgress className="p-1" size={"small"}/>
                    }

                    <LoadingButton variant="text"
                                   loading={resettingPassword}
                                   onClick={email
                                       ? async (e) => {
                                           e.preventDefault();
                                           setResettingPassword(true);
                                           try {
                                               try {
                                                   await fireCMSBackend.sendPasswordResetEmail(email);
                                                   snackbarController.open({
                                                       message: "Password reset email sent",
                                                       type: "success"
                                                   });
                                               } catch (e: any) {
                                                   snackbarController.open({
                                                       message: e.message,
                                                       type: "error"
                                                   });
                                               }
                                           } finally {
                                               setResettingPassword(false);
                                           }
                                       }
                                       : undefined}>
                        Reset password
                    </LoadingButton>

                    {loginState === "email" &&
                        <Button variant="text" onClick={() => setLoginState("registration")}>
                            New user
                        </Button>}

                    <Button type="submit" onClick={handleSubmit}>
                        {loginState === "registration" ? "Create account" : (loginState === "password" ? "Login" : "Login")}
                    </Button>
                </div>

                {previouslyUsedMethodsForUser && previouslyUsedMethodsForUser.length > 0 &&
                    <div className={"flex flex-col gap-4 p-4"}>
                        <div>
                            <Typography variant={"subtitle2"}>
                                You already have an account
                            </Typography>
                            <Typography variant={"body2"}>
                                You can use one of these
                                methods to login with {email}
                            </Typography>
                            <Typography variant={"body2"}>
                                {previouslyUsedMethodsForUser}
                            </Typography>
                        </div>
                    </div>
                }
            </div>
        </form>
    );

}
