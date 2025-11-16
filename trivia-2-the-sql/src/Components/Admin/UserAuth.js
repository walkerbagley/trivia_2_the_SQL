import React, { useState } from 'react';

const UserAuth = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data for demonstration - replace with actual API calls
  const mockUsers = [
    { id: 1, username: 'user1', email: 'user1@example.com', is_admin: false, created_at: '2025-01-01' },
    { id: 2, username: 'user2', email: 'user2@example.com', is_admin: true, created_at: '2025-01-02' },
    { id: 3, username: 'user3', email: 'user3@example.com', is_admin: false, created_at: '2025-01-03' },
  ];

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filteredUsers = mockUsers.filter(user =>
        user.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
      setUserList(filteredUsers);
      setIsLoading(false);
    }, 500);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleToggleAdmin = () => {
    if (selectedUser) {
      // TODO: Implement API call to toggle admin status
      const updatedUser = { ...selectedUser, is_admin: !selectedUser.is_admin };
      setSelectedUser(updatedUser);
      
      // Update user in the list
      setUserList(prevList =>
        prevList.map(user =>
          user.id === selectedUser.id ? updatedUser : user
        )
      );
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser && window.confirm(`Are you sure you want to delete user ${selectedUser.username}?`)) {
      // TODO: Implement API call to delete user
      setUserList(prevList => prevList.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
    }
  };

  return (
    <div className="user-auth">
      <div className="user-auth__search">
        <h2 className="user-auth__section-title">Search Users</h2>
        <div className="user-auth__search-form">
          <input
            type="text"
            placeholder="Enter username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="user-auth__search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="user-auth__search-button"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="user-auth__results">
        {userList.length > 0 && (
          <div className="user-auth__user-list">
            <h3 className="user-auth__section-title">Search Results</h3>
            <div className="user-auth__list">
              {userList.map(user => (
                <div
                  key={user.id}
                  className={`user-auth__user-item ${selectedUser?.id === user.id ? 'user-auth__user-item--selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-auth__user-info">
                    <span className="user-auth__username">{user.username}</span>
                    <span className="user-auth__email">{user.email}</span>
                    <span className={`user-auth__admin-status ${user.is_admin ? 'user-auth__admin-status--admin' : 'user-auth__admin-status--user'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="user-auth__user-details">
            <h3 className="user-auth__section-title">User Details</h3>
            <div className="user-auth__details-card">
              <div className="user-auth__detail-row">
                <span className="user-auth__detail-label">Username:</span>
                <span className="user-auth__detail-value">{selectedUser.username}</span>
              </div>
              <div className="user-auth__detail-row">
                <span className="user-auth__detail-label">Email:</span>
                <span className="user-auth__detail-value">{selectedUser.email}</span>
              </div>
              <div className="user-auth__detail-row">
                <span className="user-auth__detail-label">Admin Status:</span>
                <span className={`user-auth__detail-value user-auth__admin-status ${selectedUser.is_admin ? 'user-auth__admin-status--admin' : 'user-auth__admin-status--user'}`}>
                  {selectedUser.is_admin ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="user-auth__detail-row">
                <span className="user-auth__detail-label">Created:</span>
                <span className="user-auth__detail-value">{selectedUser.created_at}</span>
              </div>
              
              <div className="user-auth__actions">
                <button
                  onClick={handleToggleAdmin}
                  className={`user-auth__action-button ${selectedUser.is_admin ? 'user-auth__action-button--revoke' : 'user-auth__action-button--grant'}`}
                >
                  {selectedUser.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="user-auth__action-button user-auth__action-button--danger"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAuth;