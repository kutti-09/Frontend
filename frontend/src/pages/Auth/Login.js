import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // <-- add this
import {MediaTrackLogo} from "../MediaTrackLogo.js";
import { Link } from "react-router-dom";

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const submit = (data) => {
    alert('email is ' + data.email);
    alert('password is ' + data.password);
    axios.post("http://localhost:8082/user/login", data)
      .then(response => {
        const { token, role } = response.data;
        console.log("Login success ", token);
        console.log("Role:", role);

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        
        if (role === "Viewer") {
          navigate("/home", { replace: true });
        } else if (role === "Editor") {
          navigate("/user-dashboard", { replace: true });
        } else if (role === "AdOps") {
          navigate("/manager-dashboard", { replace: true });
        } else if (role === "Operator") {
          navigate("/manager-dashboard", { replace: true });
        }else if (role === "Admin") {
          navigate("/admin", { replace: true });
        } else {
          // fallback
          navigate("/unauthorized", { replace: true });
        }
      })
      .catch(error => {
        console.error("Login failed");
      });
  };
  
  const movieImages = Array.from({ length: 24 }, (_, i) =>
    `/img/img${i + 1}.jpg`
  );

  
const PosterCol = ({ images, direction = "up" }) => (
  <div className={`poster-col ${direction}`}>
    {/* First copy */}
    {images.map((src, i) => (
      <img
        key={`a-${i}`}
        src={src}
        alt=""
        width={300}
        height={450}
        loading="lazy"
        decoding="async"
      />
    ))}
    
    {/* Second copy for seamless loop */}
    {images.map((src, i) => (
      <img
        key={`b-${i}`}
        src={src}
        alt=""
        width={300}
        height={450}
        loading="lazy"
        decoding="async"
      />
    ))}
  </div>
);
  
const col1 = movieImages.slice(0, 6);
const col2 = movieImages.slice(6, 12);
const col3 = movieImages.slice(12, 18);
const col4 = movieImages.slice(18, 24);


  return (
    <div className="login-root login-page">
      {/* LEFT: OTT poster wall with alternating vertical marquee */}
      <aside className="poster-wall" aria-hidden="true">
        <div className="poster-columns">
          <PosterCol images={col1} direction="up" />
          <PosterCol images={col2} direction="down" />
          <PosterCol images={col3} direction="up" />
          <PosterCol images={col4} direction="down" />
        </div>
        <div className="poster-gradient-left" />
        <div className="poster-gradient-right" />
      </aside>

      {/* RIGHT: Original form inside a styled card */}
      <main className="auth-side">
        <div className="auth-card-header">
                <MediaTrackLogo />
        </div>
        <div className="auth-card">
            <h1 className="auth-title">Log in to your account</h1>
          <div className="container">
            <form onSubmit={handleSubmit(submit)}>

              <div className="form-group">
                <input
                    type="email"                     // <-- move here
                    placeholder="Enter email" 
                  {...register('email', {
                    required: 'email is required',
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email'
                    }
                  })}
                  className="form-control"
                />
                {errors.email && <p className="err">{errors.email.message}</p>}
              </div>

              <div className="form-group">
                <input
                    type="password"                  
                    placeholder="Enter password"

                  {...register('password', {
                    required: true,
                  })}
                  className="form-control"
                />
                {errors.password && <p className="err">password is empty</p>}
              </div>

              <div className="form-group">
                <button type="submit" className="btn-primary-new">Login</button>
              </div>
            </form>
          </div>
          <div className="login-link">
            New to MediaTrack?{" "}
              <Link to="/register" className="login-text">
                Sign up
              </Link>
          </div>
        </div>
      </main>
    </div>
  );
};