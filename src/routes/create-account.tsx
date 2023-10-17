import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
    Error,
    Input,
    Switcher,
    Title,
    Wrapper,
    Form,
} from "../components/auth-components";
import SocicalButton from "../components/sociallogin-btn";

export default function CreateAccount() {
    const [isLoading, setLoading] = useState(false);
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { name, value },
        } = e;

        if (name === "name") {
            setname(value);
        } else if (name === "email") {
            setemail(value);
        } else if (name === "password") {
            setpassword(value);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); //새로고침방지
        setError("");

        if (isLoading || name === "" || email === "" || password === "") return;

        try {
            //create an account
            setLoading(true);
            const credentials = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            ); //성공시 자격을 증명받음.
            console.log(credentials.user);

            // set the name of the user.
            //파이어베이스 인증에는 사용자를 위한 미니 프로필 같은게 있음.
            //사용자 프로필에 표시될 이름(display name), 아바타 URL이 있음.
            await updateProfile(credentials.user, {
                displayName: name,
            });
            //redirect to the home page
            navigate("/");
        } catch (e) {
            //setError
            if (e instanceof FirebaseError) {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }

        console.log(name, email, password);
    };

    return (
        <Wrapper>
            <Title>Join 🐦 </Title>
            <Form onSubmit={onSubmit}>
                <Input
                    onChange={onChange}
                    name="name"
                    value={name}
                    placeholder="Name"
                    type="text"
                    required
                />
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
                    value={isLoading ? "Loading..." : "Create Account"}
                />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account? <Link to="/login">Log In &rarr;</Link>
            </Switcher>
            <SocicalButton />
        </Wrapper>
    );
}
