import { useState } from "react";
import axios from "axios";

const ResumePage = () => {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!resume) {
        setMessage("Please select a PDF file");
        return;
      }

      const formData = new FormData();
      formData.append("resume", resume);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <br />
      <br />

      <button onClick={handleUpload}>Upload</button>

      <p>{message}</p>
    </div>
  );
};

export default ResumePage;