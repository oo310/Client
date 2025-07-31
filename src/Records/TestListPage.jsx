import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import * as XLSX from 'xlsx';

const TestListPage = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [userMap, setUserMap] = useState({});
    // 取得 quiz 集合所有題目
    const [quizTitles, setQuizTitles] = React.useState({});

    useEffect(() => {
        async function fetchTests() {
            const snapshot = await getDocs(collection(db, 'test'));
            const testList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTests(testList);
            setLoading(false);
        }
        fetchTests();
    }, []);

    // 取得所有 test 文件ID 對應的 user name
    useEffect(() => {
        async function fetchUserNames() {
            const allTestIds = tests.map(test => test.id);
            const map = {};
            await Promise.all(
                allTestIds.map(async (id) => {
                    const userRef = doc(db, 'users', id);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().name) {
                        map[id] = userSnap.data().name;
                    }
                })
            );
            setUserMap(map);
        }
        if (tests.length > 0) fetchUserNames();
    }, [tests]);

    // 取得 quiz 集合所有題目
    useEffect(() => {
        async function fetchQuizTitles() {
            const quizSnapshot = await getDocs(collection(db, 'quiz'));
            const map = {};
            quizSnapshot.forEach(doc => {
                map[doc.id] = doc.data().title;
            });
            setQuizTitles(map);
        }
        fetchQuizTitles();
    }, []);

    // 匯出 Excel（分三個 sheet）
    const handleDownloadExcel = () => {
        const test0515 = tests.find(test => test.id === '0515' && typeof test.list === 'object' && Array.isArray(test.list));
        if (!test0515) return;
        const quizOrder = test0515.list.map(item => item);
        // 標題列
        const header = ['user 名字', ...quizOrder.map(qid => quizTitles[qid] || qid)];
        // 三種資料
        const rowsCorrect = [];
        const rowsAttempts = [];
        const rowsTime = [];
        tests.filter(test => userMap[test.id]).forEach(test => {
            // 先判斷這一行是否有任何 quizOrder 有資料且通過時間判斷
            const hasAnyRecord = quizOrder.some(qid => {
                const record = test[qid];
                if (!record || typeof record !== 'object' || Object.keys(record).length === 0 || !record.timestamp) return false;
                let dateObj = record.timestamp;
                if (dateObj && dateObj.toDate) {
                    dateObj = dateObj.toDate();
                } else if (typeof dateObj === 'string' || typeof dateObj === 'number') {
                    dateObj = new Date(dateObj);
                }
                const cutoff = new Date(2025, 4, 15, 0, 0, 0, 0);
                return dateObj >= cutoff;
            });
            if (!hasAnyRecord) return;
            // isCorrect
            const rowCorrect = [userMap[test.id]];
            // attempts
            const rowAttempts = [userMap[test.id]];
            // timeElapsed
            const rowTime = [userMap[test.id]];
            quizOrder.forEach(qid => {
                const record = test[qid];
                let show = false;
                if (record && typeof record === 'object' && Object.keys(record).length > 0 && record.timestamp) {
                    let dateObj = record.timestamp;
                    if (dateObj && dateObj.toDate) {
                        dateObj = dateObj.toDate();
                    } else if (typeof dateObj === 'string' || typeof dateObj === 'number') {
                        dateObj = new Date(dateObj);
                    }
                    const cutoff = new Date(2025, 4, 15, 0, 0, 0, 0);
                    if (dateObj >= cutoff) show = true;
                }
                if (!record || typeof record !== 'object' || Object.keys(record).length === 0 || !show) {
                    rowCorrect.push('');
                    rowAttempts.push('');
                    rowTime.push('');
                } else {
                    rowCorrect.push(record.isCorrect === true ? '✔️' : record.isCorrect === false ? '❌' : '-');
                    rowAttempts.push(record.attempts !== undefined ? record.attempts : '');
                    rowTime.push(record.timeElapsed !== undefined ? record.timeElapsed : '');
                }
            });
            rowsCorrect.push(rowCorrect);
            rowsAttempts.push(rowAttempts);
            rowsTime.push(rowTime);
        });
        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet([header, ...rowsCorrect]);
        const ws2 = XLSX.utils.aoa_to_sheet([header, ...rowsAttempts]);
        const ws3 = XLSX.utils.aoa_to_sheet([header, ...rowsTime]);
        XLSX.utils.book_append_sheet(wb, ws1, '作答正確');
        XLSX.utils.book_append_sheet(wb, ws2, '作答次數');
        XLSX.utils.book_append_sheet(wb, ws3, '作答秒數');
        XLSX.writeFile(wb, 'TestList.xlsx');
    };

    if (loading) return <div style={{ padding: 40 }}>載入中...</div>;
    // console.log(tests);
    return (
        <div style={{ maxWidth: 3000, margin: '0 auto', padding: 0 }}>
            <h2>Test 對應 user 名字</h2>
            <button onClick={handleDownloadExcel} style={{marginBottom: 16}}>下載 Excel</button>
            {tests.length === 0 ? (
                <div>尚無資料</div>
            ) : (
                <>
                    {/* 取得 0515 的所有題目欄位順序 */}
                    {(() => {
                        const test0515 = tests.find(test => test.id === '0515' && typeof test.list === 'object' && Array.isArray(test.list));
                        if (!test0515) return null;

                        const quizOrder = test0515.list.map(item => item);
                        // console.log(quizOrder);
                        return (
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9', borderRadius: 4, marginBottom: 32 }}>
                                <thead>
                                    <tr>
                                        <th>user 名字</th>
                                        {quizOrder.map(qid => (
                                            <th key={qid}>{quizTitles[qid] || qid}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.filter(test => userMap[test.id]).map(test => {
                                        // 先判斷這一行是否有任何 quizOrder 有資料且通過時間判斷
                                        const hasAnyRecord = quizOrder.some(qid => {
                                            const record = test[qid];
                                            if (!record || typeof record !== 'object' || Object.keys(record).length === 0 || !record.timestamp) return false;
                                            let dateObj = record.timestamp;
                                            if (dateObj && dateObj.toDate) {
                                                dateObj = dateObj.toDate();
                                            } else if (typeof dateObj === 'string' || typeof dateObj === 'number') {
                                                dateObj = new Date(dateObj);
                                            }
                                            const cutoff = new Date(2025, 4, 15, 0, 0, 0, 0);
                                            return dateObj >= cutoff;
                                        });
                                        if (!hasAnyRecord) return null;
                                        return (
                                            <tr key={test.id}>
                                                <td>{userMap[test.id]}</td>
                                                {quizOrder.map(qid => {
                                                    const record = test[qid];
                                                    let show = false;
                                                    if (record && typeof record === 'object' && Object.keys(record).length > 0 && record.timestamp) {
                                                        let dateObj = record.timestamp;
                                                        if (dateObj && dateObj.toDate) {
                                                            dateObj = dateObj.toDate();
                                                        } else if (typeof dateObj === 'string' || typeof dateObj === 'number') {
                                                            dateObj = new Date(dateObj);
                                                        }
                                                        const cutoff = new Date(2025, 4, 15, 0, 0, 0, 0);
                                                        if (dateObj >= cutoff) show = true;
                                                    }
                                                    if (!record || typeof record !== 'object' || Object.keys(record).length === 0 || !show) return null;
                                                    return (
                                                        <td key={qid}>
                                                            {record.isCorrect === true ? '✔️' : record.isCorrect === false ? '❌' : '-'}<br />
                                                            {record.attempts !== undefined ? `次數:${record.attempts}` : ''}<br />
                                                            {record.timeElapsed !== undefined ? `秒:${record.timeElapsed}` : ''}<br />
                                                           
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        );
                    })()}
                </>
            )}
        </div>
    );
};

export default TestListPage;
