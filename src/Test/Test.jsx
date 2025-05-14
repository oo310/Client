import React, { useEffect, useRef, useState ,useContext} from 'react';
import { DataContext } from '../DataContext';
import interact from 'interactjs';
import "./Test.css"
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti'; 
import { useAuth } from '../AuthContext';

import { updateTestGrades } from "../firebase/firebaseUserGrades";;

const Test = () => {
  const { userInfo } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const code = location.state?.code || "";
  const testIds = location.state?.testIds || []; // 你可以在 navigate 時一併傳 testIds
  const { quizs } = useContext(DataContext) || {};
  // 依 testIds 順序組合題目
  const groupedQuizs = testIds
    .map(id => quizs.find(q => q.id === id))
    .filter(Boolean);
  // 只取 testIds 裡的題目
  const item = groupedQuizs.find(q => q.id === id);
  const navigate = useNavigate();
  const answerZoneRef = useRef(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [blocks, setBlocks] = useState([]);
  
  useEffect(() => {
    setTimeElapsed(0);
    setAttempts(0);
    // 重置 blocks 和 codeLabels 狀態
    if (item && item.code) {
      const initialBlocks = item.code.map((code, index) => ({
        code,
        label: item.codeLabels ? item.codeLabels[index] : null,
      }));
  
      if (initialBlocks.length > 1) {
        let randomOrder;
        do {
          randomOrder = [...initialBlocks].sort(() => Math.random() - 0.5);
        } while (randomOrder.map(block => block.code).join('') === item.code.join(''));
        setBlocks(randomOrder);
      } else {
        setBlocks(initialBlocks);
      }
    }
    // 初始化拖曳
    interact('.block').draggable({
      listeners: {

        move(event) {
          const target = event.target;

          // 計算拖曳後的位置
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // 更新元素位置
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        },
        end(event) {
          // 重置位置數據
          const target = event.target;
          target.style.transform = '';
          target.removeAttribute('data-x');
          target.removeAttribute('data-y');
        },
      },
    });

    // 初始化放置區
    interact('.zone').dropzone({

      ondragenter(event) {
        const zone = event.target;
        zone.classList.add('hover');
      },
      ondragleave(event) {
        const zone = event.target;
        zone.classList.remove('hover');
      },
      ondrop(event) {
        const draggedBlock = event.relatedTarget; // 被拖曳的積木
        const dropZone = event.target; // 目標放置區

        dropZone.classList.remove('hover');

        // 判斷拖曳目標的垂直位置
        const dropZoneBlocks = Array.from(dropZone.querySelectorAll('.block'));
        const draggedRect = draggedBlock.getBoundingClientRect();

        let inserted = false;

        for (const block of dropZoneBlocks) {
          const blockRect = block.getBoundingClientRect();

          // 如果被拖曳物件在目標物件上方，插入到該物件前面
          if (draggedRect.top < blockRect.top) {
            dropZone.insertBefore(draggedBlock, block);
            inserted = true;
            break;
          }
        }

        // 如果未插入，放置到目標區域的最後
        if (!inserted) {
          dropZone.appendChild(draggedBlock);
        }
      },
      ondropdeactivate(event) {
        event.target.classList.remove('hover');
      },
    });

    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // 清除 interact.js 的設定
    return () => {
      interact('.block').unset();
      interact('.zone').unset();
      clearInterval(timerRef.current);
    };
  }, [item]); // 當 item 改變時執行

  const toggleColorInfo = () => {
    setShowColorInfo(v => !v);
  };
  // 檢查答案邏輯
  const handleSubmit = () => {
    const blocks = answerZoneRef.current.querySelectorAll('.block');
    const userOrder = Array.from(blocks).map((block) => block.textContent);
    setAttempts((prevAttempts) => {
      const newAttempts = prevAttempts + 1;
      const isUserCorrect = JSON.stringify(userOrder) === JSON.stringify(item.code);

      if (isUserCorrect) {
        setIsCorrect(true);
        clearInterval(timerRef.current);
        updateTestGrades(userInfo.uid, item, timeElapsed, newAttempts, isUserCorrect)
          .then(() => console.log("🔥 Firebase 更新成功"))
          .catch((error) => console.error("🔥 Firebase 更新失敗", error));

        Swal.fire({
          title: "答對了！",
          text: `恭喜你完成這個題目！\n用時 ${timeElapsed} 秒\n作答次數：${newAttempts}`,
          icon: "success",
          confirmButtonText: "太棒了",
          confirmButtonColor: "#3085d6",
          didOpen: () => {
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999,
              });
            }, 100);
          },
        });
      } else {
        Swal.fire({
          title: "答案不對喔",
          text: "再試試看吧！",
          icon: "error",
          confirmButtonText: "再來一次",
          confirmButtonColor: "#d33",
        });
      }

      return newAttempts;
    });
  };
  const handleReturnToSet = () => {
    navigate('/te_list', { state: { code } });
  };

  const handleNextExercise = () => {
    const currentIndex = groupedQuizs.findIndex(ex => ex.id === item.id);
    if (currentIndex < groupedQuizs.length - 1) {
      const nextExercise = groupedQuizs[currentIndex + 1];
      setIsCorrect(false)
      // navigate('/test', { state: { item: nextExercise, groupedQuizs } });
      navigate(`/test/${nextExercise.id}`, { state: { code, testIds } });
    } else {
      Swal.fire({
        title: '恭喜！',
        text: '你已完成最後一題！',
        icon: 'success',
        confirmButtonText: '返回題組',
      }).then(() => {
        handleReturnToSet();
      });
    }
  };

  const getColorByLabel = (label) => {
    switch (label) {
      case '賦值': // Variables (淺橙色)
        return { backgroundColor: '#FFE8D6' };
      case '運算': // Operators (改為淺藍綠色，與背景區分)
        return { backgroundColor: '#b5e8cb' };
      case '迴圈': // Control (加深為較明顯的橘色)
        return { backgroundColor: '#FFD6A5' };
      case '條件判斷': // Control (與迴圈協調但略有差異)
        return { backgroundColor: '#FFDDB9' };
      case '函式定義': // My Blocks (淺粉色)
        return { backgroundColor: '#FFE6EB' };
      case '輸出': // Looks (淺紫色)
        return { backgroundColor: '#EFE6FF' };
      case '輸入': // Sensing (淺藍色)
        return { backgroundColor: '#E6F5FB' };
      case '函式呼叫': // My Blocks (淺粉色，比函式定義稍微淡一點)
        return { backgroundColor: '#FFF0F5' };
      default:
        return { backgroundColor: '#F9F9F9' }; // 預設使用非常淺的灰色
    }
  };

  if (!quizs || quizs.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>載入中...</div>;
  
  }


  return (
    <>
      <div className="exercise-header">
        <div className="header-content">
          <h3 className="question-title">{item.title}</h3>
          <p className="timer">⏳ 時間：{timeElapsed} 秒 | 📝 作答次數：{attempts}</p>
        </div>
        <div className="question-description">
          <p><strong>題目說明：</strong></p>
          <p>{item.question}</p>
        </div>
      </div>

      <div className="answer-header" style={{ justifycontent: 'space-between', width: '100%' }} >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ marginBottom: 0 }}>作答區</h2>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={toggleColorInfo}
              style={{
                fontSize: '20px',
                background: '#e9f7ef',
                borderRadius: '8px',
                padding: '8px 16px',
                lineHeight: 1.7,
                alignItems: 'center',
                color: '#333',
                // boxShadow: '0 1px 4px ',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-circle-question"></i>
            </button>
            {showColorInfo && (
              <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,         // 靠齊右側
                left: 'auto',
                zIndex: 10,
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 2px 8px #ccc',
                minWidth: '120px',
                maxWidth: '90vw', // 避免超出畫面
                overflowX: 'auto'
              }}
              >
                <b>顏色說明：</b>
                <div style={{ display: 'flex', flexDirection: "column", flexWrap: 'nowrap', gap: '12px', marginTop: '8px' }}>
                  <span style={{ background: '#FFE8D6', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>賦值</span>
                  <span style={{ background: '#b5e8cb', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>運算</span>
                  <span style={{ background: '#FFD6A5', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>迴圈</span>
                  <span style={{ background: '#FFDDB9', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>條件判斷</span>
                  <span style={{ background: '#FFE6EB', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>函式定義</span>
                  <span style={{ background: '#EFE6FF', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>輸出</span>
                  <span style={{ background: '#E6F5FB', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>輸入</span>
                  <span style={{ background: '#FFF0F5', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>函式呼叫</span>
                </div>
              </div>
            )}
          </div>

        </div>

        <div id="answer-zone" className="zone" ref={answerZoneRef}>
          {blocks.map((line, index) => (
            <div
              key={index}
              className="block block-content"
              draggable="true"
              data-code={index}
              style={getColorByLabel(line.label)}
            >
              {line.code}
            </div>
          ))}
        </div>
      </div>

      <div className="button-group" style={{
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          送出答案
        </button>

        <button
          onClick={handleReturnToSet}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回題組
        </button>

        {isCorrect && (
          <button
            onClick={handleNextExercise}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            下一題
          </button>
        )}
      </div>
      <div style={{ height: '40px', width: '100%' }} />
    </>
  );
};

export default Test;