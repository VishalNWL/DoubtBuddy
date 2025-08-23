import { Discussion } from "../Models/Discussion.model.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

// GET /api/v1/discussion/history?class=5&batch=A&limit=50
export const getHistory = asyncHandler(async (req, res) => {
  const user = req.user; // from your jwtverify middleware (student/admin)
  if (!user || user.role !== "student") {
    return res.status(403).json(new Apiresponse(403, {}, "Forbidden"));
  }

  let {classNum, batch,limit}= req.body;

 if(!classNum || !batch){
    return res.status(400).json(new Apiresponse(400,{},"Provide all the fields"));
 }

  if(!limit){
    limit =50;
  }
  
  const docs = await Discussion.find({
    school: user.school,
    class: classNum,
    batch,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // reverse to chronological order
  const messages = docs.reverse();

  return res.status(200).json(new Apiresponse(200, { messages }, "History fetched"));
});
