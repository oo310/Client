import React, { useEffect, useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import { AddMaterialModal, AddExerciseModal } from './Modals';
import Button from 'react-bootstrap/Button';
import { marked } from 'marked';
import { useAuth } from '../AuthContext';
import { Row,Col } from 'react-bootstrap';
import { deleteDocument } from '../firebase/firebaseCRUD';

const List = () => {
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const { lessons } = useContext(DataContext);
  const { userInfo } = useAuth();

  const handleMaterialSubmit = (material) => {
    console.log('New material:', material);
    // 新增教材邏輯
  };

  const handleExerciseSubmit = (exercise) => {
    console.log('New exercise:', exercise);
    // 新增題目邏輯
  };

  // 編輯課程的處理函式
  const handleEdit = (lessonId) => {
    console.log('Edit lesson', lessonId);
    // 編輯邏輯
  };

  // 刪除課程的處理函式
  const handleDelete = async (lessonId) => {
    console.log('Delete lesson', lessonId);
    try {
      await deleteDocument('lessons', lessonId);
      console.log('Lesson deleted successfully');
      // 你可能需要在這裡更新本地狀態以反映刪除操作
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const handleLessonClick = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {userInfo?.role === "admin" && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setIsMaterialModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 me-2"
            >
              新增教材
            </Button>
            <Button
              onClick={() => setIsExerciseModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              新增題目
            </Button>
          </div>
        )}

        <div id="data-list" className="mt-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-item bg-gray-50 rounded-lg shadow-sm mb-2">
              <Row
                // className="lesson-header d-inline-flex  p-3 hover:bg-gray-100 rounded-lg"
                className=' display-flex p-3 hover:bg-gray-100 rounded-lg'
                onClick={() => {
                  handleLessonClick(lesson.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
              >
                <Col><span>{lesson.title}</span></Col>
                <Col className='d-flex justify-content-end'>
                  {userInfo?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(lesson.id);
                        }}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="danger"
                        className='ms-2 '
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lesson.id);
                        }}
                      >
                        刪除
                      </Button>
                    </div>
                  )}</Col>

              </Row>


              {expandedLesson === lesson.id && (
                <div className="lesson-details p-4 border-t border-gray-200">
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(lesson.content) || 'No description available'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <AddMaterialModal
          isOpen={isMaterialModalOpen}
          onClose={() => setIsMaterialModalOpen(false)}
          onSubmit={handleMaterialSubmit}
        />

        <AddExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          onSubmit={handleExerciseSubmit}
        />
      </div>
    </div>
  );
};

export default List;
