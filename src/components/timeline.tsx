import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createdAt: number;
}

export default function Timeline() {
    const [tweets, setTweet] = useState<ITweet[]>([]);

    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createdAt", "desc"),
                limit(25)
            );

            //데이터 쿼리하기
            // const spanshot = await getDocs(tweetsQuery); //쿼리의 스냅샷을 받아서
            // const tweets = spanshot.docs.map((doc) => {
            //     const { tweet, createdAt, userId, username, photo } = doc.data();
            //     return {
            //         //받은 모든 문서마다 이와 같은 개체를 만들어줌.
            //         tweet,
            //         createdAt,
            //         userId,
            //         username,
            //         photo,
            //         id: doc.id,
            //     };
            // });
            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const { tweet, createdAt, userId, username, photo } =
                        doc.data();
                    return {
                        //받은 모든 문서마다 이와 같은 개체를 만들어줌.
                        tweet,
                        createdAt,
                        userId,
                        username,
                        photo,
                        id: doc.id,
                    };
                });
                setTweet(tweets);
            }); //이벤트 리스너를 연결
        };
        fetchTweets();
        return () => {
            unsubscribe && unsubscribe();
        };
    }, []);
    return (
        <Wrapper>
            {tweets.map((tweet) => (
                <Tweet key={tweet.id} {...tweet} />
            ))}
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: scroll;
    //스크롤바 안보이게함.(기능은 됨.)
    &::-webkit-scrollbar {
        display: none;
    }
`;
