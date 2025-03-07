import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import AceEditor from 'react-ace';
import ace from 'ace-builds';
import { uploadLesson, uploadExercise } from "../firebase/firebaseCRUD";

// 導入 ace 構建
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
ace.config.set(
    'basePath',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/'
);
export const AddMaterialModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !content) {
            alert("請填寫所有必填欄位！");
            return;
        }

        setLoading(true); // ✅ 防止多次點擊
        try {
            const lessonId = await uploadLesson(title, content); // ✅ 確保是 `await`
            if (lessonId) {
                alert(`✅ 教材上傳成功！ID: ${lessonId}`);
            } else {
                alert("🔥 上傳失敗，請稍後再試！");
            }
            setTitle('');
            setContent('');
            onClose();
        } catch (error) {
            console.error("🔥 教材上傳失敗", error);
            alert("🔥 上傳失敗，請稍後再試！");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose} centered className='modal-lg'>
            <Modal.Header closeButton>
                <Modal.Title>新增教材</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>教材標題：</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="輸入教材標題"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>教材內容 (Markdown)：</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="輸入教材內容"
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "上傳中..." : "上傳教材"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export const AddExerciseModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [tag, setTag] = useState('');
    const [question, setQuestion] = useState('');
    const [code, setCode] = useState(''); // ✅ 直接儲存成陣列
    const [loading, setLoading] = useState(false);
    const aceEditorRef = useRef(null); // ✅ 用 useRef 取得 Ace Editor 物件

    const handleSubmit = async () => {
        if (!title || !tag || !question || code.length === 0) {
            alert("請填寫所有必填欄位！");
            return;
        }

        setLoading(true);
        try {
            const exerciseId = await uploadExercise(title, tag, question, code);
            alert(`✅ 題目上傳成功！ID: ${exerciseId}`);
            setTitle('');
            setTag('');
            setQuestion('');
            setCode([]);
            onClose();
        } catch (error) {
            alert("🔥 上傳失敗，請稍後再試！");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered className='modal-lg'>
            <Modal.Header closeButton>
                <Modal.Title>新增題目</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>題目標題：</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="輸入題目標題"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>題組類型：</Form.Label>
                        <Form.Control
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            placeholder="輸入題組類型"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>題目內容：</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="輸入題目內容"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>正確答案：</Form.Label>
                        <AceEditor
                            mode="python"
                            theme="github"
                            onLoad={(editor) => {
                                aceEditorRef.current = editor; // ✅ 儲存 Ace Editor 物件
                            }}
                            onChange={() => {
                                if (aceEditorRef.current) {
                                    const codeLines = aceEditorRef.current
                                        .getSession()
                                        .getDocument()
                                        .getAllLines()
                                        .filter(line => line.trim() !== ""); // ✅ 移除空白行
                                    setCode(codeLines);
                                }
                            }}
                            name="python-editor"
                            editorProps={{ $blockScrolling: true }}
                            width="100%"
                            height="300px"
                            fontSize={20}
                            showPrintMargin={false}
                            showGutter={true}
                            highlightActiveLine={true}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 4,
                                useSoftTabs: true,
                            }}
                        />

                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "上傳中..." : "上傳題目"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

