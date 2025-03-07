import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import "./Exercise.css"
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti'; 
import { useAuth } from '../AuthContext';

import { updateUserGrades } from "../firebase/firebaseUserGrades";;

const Exercise = () => {
  const { userInfo } = useAuth();
  const location = useLocation();
  const { item,groupedQuizs } = location.state || {};
  const navigate = useNavigate();
  const answerZoneRef = useRef(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  
  const [blocks, setBlocks] = useState(() => {
    if(item.code.length > 1) {
      let randomOrder;
      do {
        randomOrder = [...item.code].sort(() => Math.random() - 0.5);
      } while (randomOrder.join('') === item.code.join(''));
      return randomOrder;
    }
    return [...item.code];
  });
  
  useEffect(() => {
    // console.log(userInfo);
    setTimeElapsed(0);
    setAttempts(0);
    // 重置 blocks 狀態
    if (item.code.length > 1) {
      let randomOrder;
      do {
        randomOrder = [...item.code].sort(() => Math.random() - 0.5);
      } while (randomOrder.join('') === item.code.join(''));
      setBlocks(randomOrder);
    } else {
      setBlocks([...item.code]);
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
  

  // 檢查答案邏輯
  const handleSubmit = () => {
    const blocks = answerZoneRef.current.querySelectorAll('.block');
    // const userOrder = Array.from(blocks).map((block) => block.dataset.code);
    const userOrder = Array.from(blocks).map((block) => block.textContent);
    setAttempts((prevAttempts) => {
      const newAttempts = prevAttempts + 1; // ✅ 確保取得最新 attempts
  
      if (JSON.stringify(userOrder) === JSON.stringify(item.code)) {
        setIsCorrect(true);
        clearInterval(timerRef.current);

        updateUserGrades(userInfo.uid, item, timeElapsed, newAttempts)
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
  
      return newAttempts; // ✅ 確保狀態更新
    });
  }; 
  const handleReturnToSet = () => {
    navigate('/ex_list');
  };

  const handleNextExercise = () => {
    // 假設 exerciseSet.exercises 是題目陣列
    const currentIndex = groupedQuizs.findIndex(ex => ex.id === item.id);
    // console.log(groupedQuizs);
    if (currentIndex < groupedQuizs.length - 1) {
      const nextExercise = groupedQuizs[currentIndex + 1];
      // console.log(nextExercise);
      setIsCorrect(false)
      navigate('/exercise', { state: { item: nextExercise, groupedQuizs } });
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

  return (
    <>
      <div className="exercise-header">
        <div className="header-row">
          <h3 className="question-title">{item.title}</h3>
          <p className="timer">⏳ 時間：{timeElapsed } 秒 | 📝 作答次數：{attempts}</p>
        </div>
        <div className="question-description">
          <p><strong>題目說明：</strong></p>
          <p>{item.question}</p>
        </div>
      </div>

      <div className="answer-header">
        <h2>作答區</h2>
        <div id="answer-zone" className="zone" ref={answerZoneRef}>
          
          {blocks.map((line, index) => (
            <div key={index} className="block block-content" draggable="true" data-code={index}>
                {line}
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
      

    </>
  );
};

export default Exercise;
