import axios from "axios";
import { API_URL } from "@/config";

// No default Content-Type: axios sets application/json only on requests with a
// body. On a GET it would make the browser send a CORS preflight before every poll.
const apiHandler = axios.create({ baseURL: API_URL });

export default apiHandler;
