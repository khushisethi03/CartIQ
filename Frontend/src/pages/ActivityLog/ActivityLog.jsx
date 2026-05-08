import './ActivityLog.css'
import { useEffect, useState } from "react";
import axios from "axios";

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
    axios.get("http://localhost:8080/api/v1.0/api/activity", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => {
        console.log("API DATA:", res.data); // 👈 ADD THIS
        setLogs(res.data);
    })
    .catch(err => console.log(err));
}, []);

    return (
        <div className="container mt-4">
            <h3>Activity Log</h3>

            <table className="table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Time</th>
                    </tr>
                </thead>
               <tbody>
    {logs && logs.length > 0 ? (
        logs.map((log, index) => (
            <tr key={index}>
                <td>{log.action}</td>
                <td>{log.description}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="3">No activity found</td>
        </tr>
    )}
</tbody>
            </table>
        </div>
    );
}