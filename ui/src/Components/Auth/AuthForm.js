const AuthForm = ({ user, onChange, onSubmit }) => {
    return (
      <div className="authform">
        <form onSubmit={onSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={user.username}
              onChange={onChange}
              name="username"
              placehoder="Username"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={user.password}
              onChange={onChange}
              name="password"
              placehoder="Password"
              required
            />
          </div>
          <div>
            <button type="submit" onSubmit={onSubmit}>
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  };
  export default AuthForm;