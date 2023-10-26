import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [editmode, setEditmode] = useState(false);
    const [editName, setEditName] = useState(user?.displayName ?? "Anonymous");

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, { photoURL: avatarUrl });
        }
    };

    //에딧모드 상태변화
    const onEditname = () => {
        setEditmode((prev) => !prev);
    };

    //사용자 ID 변경
    const onSave = async () => {
        if (user) {
            await updateProfile(user, { displayName: editName });
            onEditname(); // 편집모드 종료
        }
    };
    const fetchTweets = async () => {
        //쿼리 생성
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const { tweet, createdAt, userId, username, photo } = doc.data();
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
        setTweets(tweets);
    };

    useEffect(() => {
        fetchTweets();
    }, []);
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {Boolean(avatar) ? (
                    <AvatarImg src={avatar as string} />
                ) : (
                    <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                    </svg>
                )}
            </AvatarUpload>
            <AvatarInput
                onChange={onAvatarChange}
                id="avatar"
                type="file"
                accept="image/*"
            />
            {editmode ? (
                <>
                    <NameTextArea
                        onChange={(e) => setEditName(e.target.value)}
                        value={editName}
                    />
                    <Button>
                        <CancleButton onClick={onEditname}>Cancle</CancleButton>
                        <EditButton onClick={onSave}>Save</EditButton>
                    </Button>
                </>
            ) : (
                <FullName>
                    <Name>{user?.displayName ?? "Anonymous"}</Name>
                    <Edit onClick={onEditname}>
                        <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                            <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                        </svg>
                    </Edit>
                </FullName>
            )}

            <Tweets>
                {" "}
                {tweets.map((tweet) => (
                    <Tweet key={tweet.id} {...tweet} />
                ))}
            </Tweets>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;
const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        width: 50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;
`;
const AvatarInput = styled.input`
    display: none;
`;
const Name = styled.span`
    font-size: 22px;
`;
const Tweets = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const Edit = styled.div`
    width: 20px;
    margin-left: 5px;
    cursor: pointer;
`;

const FullName = styled.div`
    display: flex;
`;

export const NameTextArea = styled.input`
    border: 2px solid white;
    padding: 20px;
    border-radius: 16px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 300px;
    height: 50px;
    resize: none; // textarea 사이즈 조절 불가하게 만들기
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;
    &::placeholder {
        font-size: 16px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
    }

    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;
const CancleButton = styled.button`
    margin-right: 5px;
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 5px;
`;
const EditButton = styled.button`
    margin-right: 5px;
    background-color: lime;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 5px;
`;
const Button = styled.div`
    display: flex;
`;
