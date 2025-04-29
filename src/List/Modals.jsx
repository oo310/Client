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

    const handleClose = () => {
        setTitle('');
        setContent('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={handleClose} centered className='modal-lg'>
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
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
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
    const [code, setCode] = useState([]); // ✅ 直接儲存成陣列
    const [codeLabels, setCodeLabels] = useState([]); // 新增的標籤欄位
    const [loading, setLoading] = useState(false);
    const aceEditorRef = useRef(null); // ✅ 用 useRef 取得 Ace Editor 物件
    const labelInputRefs = useRef([]); // 用 useRef 儲存標籤輸入框的引用

    const handleSubmit = async () => {
        if (!title || !tag || !question || code.length === 0 || codeLabels.length !== code.length) {
            alert("請填寫所有必填欄位！");
            return;
        }

        setLoading(true);
        try {
            const exerciseId = await uploadExercise(title, tag, question, code, codeLabels);
            alert(`✅ 題目上傳成功！ID: ${exerciseId}`);
            setTitle('');
            setTag('');
            setQuestion('');
            setCode([]);
            setCodeLabels([]);
            onClose();
        } catch (error) {
            alert("🔥 上傳失敗，請稍後再試！");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (newCode) => {
        if (aceEditorRef.current) {
            const codeLines = aceEditorRef.current
                .getSession()
                .getDocument()
                .getAllLines()
                .filter(line => line.trim() !== ""); // ✅ 移除空白行

            // 更新標籤欄位數量和位置
            setCodeLabels(prevLabels => {
                const newLabels = [...prevLabels];
                const diff = codeLines.length - newLabels.length;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        newLabels.splice(newCode.start.row , 0, '');
                    }
                } else if (diff < 0) {
                    newLabels.splice(newCode.start.row + 1, -diff);
                }
                return newLabels;
            });

            setCode(codeLines);
        }
    };

    const handleLabelChange = (index, value) => {
        setCodeLabels(prevLabels => {
            const newLabels = [...prevLabels];
            newLabels[index] = value;
            return newLabels;
        });
    };

    const handleLabelFocus = (index) => {
        if (aceEditorRef.current) {
            aceEditorRef.current.gotoLine(index + 1, 0, true);
        }
    };

    const addLabelField = async () => {
        try {
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ label: '' }), // 根據 API 需求傳遞資料
            });
            const result = await response.json();
            if (response.ok) {
                setCodeLabels(prevLabels => [...prevLabels, result.label]);
                setCode(prevCode => [...prevCode, '']); // 確保程式碼行數和標籤數量一致
            } else {
                alert('新增標籤失敗');
            }
        } catch (error) {
            console.error('新增標籤失敗', error);
            alert('新增標籤失敗');
        }
    };

    const handleClose = () => {
        setTitle('');
        setTag('');
        setQuestion('');
        setCode([]);
        setCodeLabels([]);
        onClose();
    };

    return (
        <Modal show={isOpen} onHide={handleClose} centered className='modal-lg'>
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
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <Form.Label>正確答案：</Form.Label>
                            <div className="d-flex">
                                <AceEditor
                                    mode="python"
                                    theme="github"
                                    onLoad={(editor) => {
                                        aceEditorRef.current = editor; // ✅ 儲存 Ace Editor 物件
                                    }}
                                    onChange={(value, event) => handleCodeChange(event)}
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
                                <div className="ms-3" style={{ width: '200px' }}>
                                    {code.map((line, index) => (
                                        <Form.Group className="mb-3" key={`${line}-${index}`}>
                                            <Form.Control
                                                type="text"
                                                value={codeLabels[index] || ''}
                                                onChange={(e) => handleLabelChange(index, e.target.value)}
                                                placeholder={`輸入第 ${index + 1} 行標籤`}
                                                ref={el => labelInputRefs.current[index] = el}
                                                onFocus={() => handleLabelFocus(index)}
                                                required
                                            />
                                        </Form.Group>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <div className="me-auto">
                    <Button variant="primary" onClick={addLabelField}>
                        新增標籤
                    </Button>
                </div>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "上傳中..." : "上傳題目"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};