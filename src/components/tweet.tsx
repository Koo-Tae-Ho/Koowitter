//변경후
import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import { useState } from "react";
import { TextArea } from "./post-tweet-form";

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
    const [editMode, setEditMode] = useState(false);
    const [editTweet, setEditTweet] = useState(tweet);
    const [file, setFile] = useState<File | null>(null);

    const user = auth.currentUser;

    const onDelete = async () => {
        const ok = confirm("Are you sure yo want to delete this tweet?");
        if (!ok || user?.uid !== userId) return;

        try {
            await deleteDoc(doc(db, "tweets", id)); //삭제할 문서에 대한 참조
            //(firebase 파일에서 불러오고, 문서가 저장된 경로)
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (error) {
            console.log(error);
        } finally {
        }
    };

    const onEdit = async () => {
        setEditMode((prev) => !prev);
        if (!editMode) return;

        const ok = confirm("Are you sure you want to edit this tweet?");
        if (!ok || user?.uid !== userId) return;

        try {
            const tweetRef = doc(db, "tweets", id);

            if (file) {
                // 기존 이미지가 있다면 삭제
                if (photo) {
                    const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                    await deleteObject(photoRef);
                }

                // 새 이미지 업로드
                const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);

                // 트윗 업데이트 (이미지 URL 포함)
                await updateDoc(tweetRef, {
                    tweet: editTweet,
                    photo: url,
                });
            } else {
                // 트윗만 업데이트
                await updateDoc(tweetRef, {
                    tweet: editTweet,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setEditMode(false);
            setFile(null);
        }
    };

    const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {
            target: { value },
        } = event;
        setEditTweet(value);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        if (files && files.length === 1) {
            if (files[0].size > 1000000) {
                event.target.value = "";
                return alert("Photo size too big! \n you can upload under 1MB");
            }
            setFile(files[0]);
        }
    };

    return (
        <Wrapper>
            <Column>
                <UserName>{username}</UserName>
                {editMode ? (
                    <TextArea
                        onChange={onTextChange}
                        value={editTweet}
                    ></TextArea>
                ) : (
                    <Payload>{tweet}</Payload>
                )}
                {user?.uid === userId ? (
                    <>
                        {" "}
                        <DeleteButton onClick={onDelete}>delete</DeleteButton>
                        <EditButton onClick={onEdit}>
                            {editMode ? "save" : "edit"}
                        </EditButton>
                    </>
                ) : null}
            </Column>

            <Column>
                {editMode ? (
                    <ChangePhotoInput
                        onChange={onFileChange}
                        id="file"
                        accept="image/*"
                        type="file"
                    />
                ) : (
                    photo && <Photo src={photo} />
                )}
            </Column>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;

const Column = styled.div`
    &:last-child {
        place-self: end;
    }
`;

const Photo = styled.img`
    margin: 20px 20px 20px 20px;
    width: 120px;
    height: 120px;
    border-radius: 15px;
`;

const UserName = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
    word-break: break-all;
`;

const ChangePhotoInput = styled.input`
    width: 100%;
    height: 100%;
    background-color: white;
`;

const DeleteButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
`;

const EditButton = styled.button`
    margin-right: 5px;
    background-color: blue;
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
