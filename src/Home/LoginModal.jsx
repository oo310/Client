import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner  } from "react-bootstrap";
import { loginUser, registerUser } from "../firebase/firebaseAuth";
import { DataContext } from '../DataContext';
import { useAuth } from '../AuthContext';

const LoginModal = () => {
  const { userInfo, isLoggedOut,login } = useAuth();
  const [show, setShow] = useState(!userInfo); // 根據是否有登入來決定初始顯示
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { quizs } = useContext(DataContext);

  // 監聽 userInfo 的變化，當用戶登入後自動關閉Modal
  useEffect(() => {
    if (userInfo) {
      setShow(false); // 如果已登入，關閉視窗
    } else if (isLoggedOut) {
      setShow(true); // 如果登出，顯示視窗
    }
  }, [userInfo, isLoggedOut]);

  const handleClose = () => setShow(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };
  const handleEmailBlur = () => {
    if (!email.includes('@')) {
      setEmail(`${email}@nfu.edu.tw`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formattedEmail = email.includes('@') ? email : `${email}@nfu.edu.tw`;
    if (isLoginMode) {
      const userData = await loginUser(formattedEmail, password);
      if (userData) {
        login(userData);
        // 不需要手動關閉Modal，useEffect會處理
      } else {
        setError("登入失敗，請檢查您的帳號和密碼！");
      }
    } else {
      try {
        if (!username || !email || !password || !confirmPassword) {
          setError("請填寫所有欄位！");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("密碼與確認密碼不相符！");
          setIsLoading(false);
          return;
        }
        if (password.length > 0 && password.length < 6) {
          setError('密碼必須大於6個字');
          setIsLoading(false);
          return;
        }
        const result = await registerUser(username, formattedEmail, password, quizs);
        
        if (result.success) {
          alert(`註冊成功！歡迎，${username}！請重新登入。`);
          setIsLoginMode(true);
        } else {
          setError(result.error || "註冊失敗，請稍後再試。");
        }
      } catch (error) {
        console.error("Registration error:", error);
        setError(error.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header >
        <Modal.Title>{isLoginMode ? "登入" : "註冊"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>使用者名稱</Form.Label>
              <Form.Control
                type="text"
                placeholder="輸入您的名稱"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>電子郵件</Form.Label>
            <Form.Control
              type={isLoginMode ? "text" : "email"}
              placeholder="輸入您的電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // onBlur={handleEmailBlur}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>密碼</Form.Label>
            <Form.Control
              type="password"
              placeholder= {isLoginMode ? "輸入您的密碼":"輸入您的密碼，輸入至少6個字的密碼"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {!isLoginMode && (
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>確認密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <Button variant="primary" type="submit" className="w-100">
            {isLoading ? <Spinner animation="border" size="sm" /> : (isLoginMode ? "登入" : "註冊")}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="link" onClick={toggleMode}>
          {isLoginMode ? "還沒有帳號？註冊" : "已有帳號？登入"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;