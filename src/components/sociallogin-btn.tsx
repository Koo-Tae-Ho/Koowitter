import {
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    // signInWithRedirect,
} from "firebase/auth";
import styled from "styled-components";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function SocicalButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };
    const onClicks = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <Button onClick={onClicks}>
                <Logo src="/google-logo.svg" />
                Continue with Google
            </Button>
            <Button onClick={onClick}>
                <Logo src="/github-logo.svg" />
                Continue with Github
            </Button>
        </>
    );
}

const Button = styled.span`
    margin-top: 30px;
    background-color: white;
    font-weight: 600;
    width: 100%;
    color: black;
    padding: 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;
const Logo = styled.img`
    height: 25px;
`;
