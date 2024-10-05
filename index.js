const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const youtubedl = require("youtube-dl-exec")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Its Working")
});

app.post("/download",async(req,res)=>{
  url=req.body.url;

  const output = await youtubedl(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  })
  const lastUrl = output.formats[output.formats.length-1].url;

  res.json({url:lastUrl})

  
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
