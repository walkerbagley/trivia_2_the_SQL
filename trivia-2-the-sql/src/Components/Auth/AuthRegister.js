import React, { useEffect, useState } from "react";
import { createUser } from "./AuthService.js";
import AuthForm from "./AuthForm.js";
const AuthRegister = () => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  // flag
  const [add, setAdd] = useState(false);
  useEffect(() => {
    if (newUser && add) {
      createUser(newUser).then((userCreated) => {
        if (userCreated) {
          alert(`${userCreated.get("firstName")}, registration successful!`);
        }
        setAdd(false);
      });
    }
  }, [newUser]);
  const onChangeHandler = (e) => {
    e.preventDefault();
    console.log(e.target);
    const { name, value: newValue } = e.target; //object destructuring?
    console.log(newValue);
    setNewUser({ ...newUser, [name]: newValue }); //spread operator to append attributes to obj
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    setAdd(true);
  };
  return (
    <div>
      <AuthForm
        user={newUser}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
      />
    </div>
  );
};
export default AuthRegister;