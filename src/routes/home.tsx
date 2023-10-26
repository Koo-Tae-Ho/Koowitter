import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

export default function Home() {
    return (
        <Wrapper>
            <PostTweetForm />
            <Timeline />
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: grid;
    gap: 50px;
    overflow-y: scroll;
    grid-template-rows: 1fr 5fr;

    //스크롤바 안보이게함.(기능은 됨.)
    &::-webkit-scrollbar {
        display: none;
    }
`;
