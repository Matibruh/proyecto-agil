
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import auth from "./routes/auth";
import malla from "./routes/malla";
import carrers from "./routes/carrers";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.static(path.join(__dirname, "../public")));


app.use("/auth", auth);
app.use("/carrers", malla);    
app.use("/carrers", carrers);  


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
