const AuthForm = ({ user, onChange, onSubmit }) => {
    return (
      <div>
        <form onSubmit={onSubmit}>
          <div>
            <label>First Name</label>
            <br />
            <input
              type="text"
              value={user.firstName}
              onChange={onChange}
              name="firstName"
              placehoder="Fist Name"
              required
            />
          </div>
          <div>
            <label>Last Name</label>
            <br />
            <input
              type="text"
              value={user.lastName}
              onChange={onChange}
              name="lastName"
              placehoder="Last Name"
              required
            />
          </div>
          <div>
            <label>Email</label>
            <br />
            <input
              type="email"
              value={user.email}
              onChange={onChange}
              name="email"
              placehoder="Email"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <br />
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