import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import { auth } from "../firebase";

export default function Home() {
    return (
        <Wrapper>
            <PostTweetForm />
        </Wrapper>
    );
}

const Wrapper = styled.div``;
