import styled from "styled-components";
import { useState } from "react";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function PostTweetForm() {
    const [isLoading, setIsloading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && files.length === 1) {
            // Check if the file size is greater than 1MB
            const fileSize = files[0].size / 1024 / 1024; // Convert bytes to MB
            if (fileSize > 1) {
                alert("Please upload a file smaller than 1MB.");
                return;
            }
            setFile(files[0]);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || isLoading || tweet === "" || tweet.length > 150) return;
        try {
            setIsloading(true);
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt: Date.now(),
                username: user.displayName || "Anonymous",
                userId: user.uid,
            }); //도큐멘트 생성

            if (file) {
                const locationRef = ref(
                    storage,
                    `tweets/${user.uid}/${doc.id}`
                ); //파일이 저장 될 URL을 선택할 수 있음.
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref); //getDownloadURL의 결과값은 string을 반환하는 promise
                await updateDoc(doc, {
                    photo: url,
                });
            }
            setTweet("");
            setFile(null);
        } catch (error) {
            console.log(error);
        } finally {
            setIsloading(false);
        }
    };
    return (
        <Form onSubmit={onSubmit}>
            <TextArea
                required
                rows={5}
                maxLength={150}
                onChange={onChange}
                value={tweet}
                placeholder="What is happening?"
            ></TextArea>
            <AttachFileButton htmlFor="file">
                {file ? "Photo added ✅" : "Add photo"}
            </AttachFileButton>
            <AttachFileInput
                onChange={onFileChange}
                type="file"
                id="file"
                accept="image/*"
            />
            <SubmitBtn
                type="submit"
                value={isLoading ? "Posting..." : "Post Tweet"}
            />
        </Form>
    );
}

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
export const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 16px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
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
const AttachFileButton = styled.label`
    cursor: pointer;
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
`;
const AttachFileInput = styled.input`
    display: none;
`;
const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;

    &:hover,
    &:active {
        opacity: 0.9;
    }
`;
