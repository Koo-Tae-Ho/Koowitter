import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {
    Error,
    Input,
    Switcher,
    Title,
    Wrapper,
    Form,
} from "../components/auth-components";
import SocicalButton from "../components/sociallogin-btn";
import "../components/find-password.css";

export default function Login() {
    const [isLoading, setLoading] = useState(false);

    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [emails, setEmails] = useState("");

    const openPopup = () => setPopupOpen(true);
    const closePopup = () => setPopupOpen(false);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmails(event.target.value);
    };
    const handleSubmit = () => {
        findPassword();
        closePopup();
    };

    const findPassword = () => {
        sendPasswordResetEmail(auth, emails);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { name, value },
        } = e;

        if (name === "email") {
            setemail(value);
        } else if (name === "password") {
            setpassword(value);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); //새로고침방지
        setError("");

        if (isLoading || email === "" || password === "") return;

        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (e) {
            //setError
            if (e instanceof FirebaseError) {
                console.log(e);
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }

        console.log(email, password);
    };

    return (
        <Wrapper>
            <Title>Koowitter🐦 </Title>
            <Form onSubmit={onSubmit}>
                <Input
                    onChange={onChange}
                    name="email"
                    value={email}
                    placeholder="Email"
                    type="email"
                    required
                />
                <Input
                    onChange={onChange}
                    name="password"
                    value={password}
                    placeholder="Password"
                    type="password"
                    required
                />
                <Input
                    type="submit"
                    value={isLoading ? "Loading..." : "Log In"}
                />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Don't have an account?{" "}
                <Link to="/create-account">Create One &rarr;</Link>
            </Switcher>
            <Switcher>
                Forgot your password?{" "}
                <span className="clickableText" onClick={openPopup}>
                    {" "}
                    Find password &rarr;
                </span>
            </Switcher>
            {isPopupOpen && (
                <div className="popup">
                    <h2>Enter your email</h2>
                    <input
                        type="email"
                        value={emails}
                        onChange={handleEmailChange}
                    />
                    <div className="popup-footer">
                        <button onClick={handleSubmit}>Submit</button>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
            <SocicalButton />
        </Wrapper>
    );
}
