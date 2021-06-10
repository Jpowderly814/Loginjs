import { useEffect, useState } from "react";
import Axios from "axios";
//import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';
import Register from "./Register"


function App() {

 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const[loginStatus, setLoginStatus] = useState(false);

  Axios.defaults.withCredentials = true;


  const login = () => {
    Axios.post("http://localhost:3001/login", {
      username: username, 
      password: password,
    }).then((response) => {
      if(!response.data.auth){
        setLoginStatus(false);
      }else{
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        setLoginStatus(true);
      }

    });
  };

  const logout = () => {
    setLoginStatus(false); 
    localStorage.setItem("token", "null");
  }

  const userAuthenticated = () => {
    Axios.get("http://localhost:3001/isUserAuth", {
      headers: {"x-access-token": localStorage.getItem("token"),
    
      },
    }).then((response) => {
        console.log(response);
    });
  };

  useEffect (() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn === true){
        setLoginStatus(response.data.user[0].username);
      }
    }); 
  }, []);

  return (
    <div className="App">
      <div className = "login_fields">
      <Register/>
      

      <div className="login">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username..."
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Password..."
          onChange={(e) => {
            setPassword(e.target.value);
          }} 
        />
        <button onClick={login}> Login </button>
        
        
        <div>{loginStatus ? <p>Y</p> : <p>N</p>}</div>
        <button onClick ={logout}>Logout</button>
      </div>
      </div>
        {loginStatus && <button onClick={userAuthenticated}>Check if Authenticated</button>}
        <div>{userAuthenticated ? <p>Y</p> : <p>N</p>}</div>
        
      
    </div>
  );
}

export default App;
