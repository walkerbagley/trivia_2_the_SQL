import './styles.css';
import React, { useState } from "react";
import UserAuth from './UserAuth.js';
import QuestionReview from './QuestionReview.js';

const Admin = () => {
  const [currentTab, setCurrentTab] = useState("users");

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Admin Dashboard</h1>
        <div className="admin-page__tabs">
          <button
            onClick={() => setCurrentTab("users")}
            className={`admin-page__tab ${currentTab === "users" ? "admin-page__tab--active" : ""}`}
          >
            User Authorization
          </button>
          <button
            onClick={() => setCurrentTab("questions")}
            className={`admin-page__tab ${currentTab === "questions" ? "admin-page__tab--active" : ""}`}
          >
            Question Review
          </button>
        </div>
      </div>

      <div className="admin-page__content">
        {currentTab === "users" && <UserAuth />}
        {currentTab === "questions" && <QuestionReview />}
      </div>
    </div>
  );
};

export default Admin;